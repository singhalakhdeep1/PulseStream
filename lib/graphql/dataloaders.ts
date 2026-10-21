// ─── DataLoaders ──────────────────────────────────────────────────────────────
// DataLoaders solve the N+1 query problem in GraphQL.
//
// The N+1 problem: if you fetch 50 posts and each needs its author,
// a naive resolver makes 51 DB queries (1 for posts + 50 for authors).
//
// DataLoaders batch those 50 author lookups into ONE query:
//   SELECT * FROM profiles WHERE id IN (id1, id2, ..., id50)
//
// They also CACHE results within a request — if two posts have the same author,
// the DB is only hit once.
//
// This is why FeedFlow uses GraphQL BFF — these batching wins are significant
// for social feed queries.

import type { SupabaseClient } from "@supabase/supabase-js";

// We implement a minimal DataLoader to avoid the npm dependency on the browser-only `dataloader` package
class DataLoader<K, V> {
    private readonly batchFn: (keys: readonly K[]) => Promise<(V | Error)[]>;
    private readonly cache   = new Map<K, Promise<V>>();
    private queue:   K[]    = [];
    private pending: null | Promise<void> = null;

    constructor(batchFn: (keys: readonly K[]) => Promise<(V | Error)[]>) {
        this.batchFn = batchFn;
    }

    load(key: K): Promise<V> {
        if (this.cache.has(key)) return this.cache.get(key)!;

        const promise = new Promise<V>((resolve, reject) => {
            this.queue.push(key);

            if (!this.pending) {
                this.pending = Promise.resolve().then(() => {
                    this.pending = null;
                    const keys    = this.queue;
                    this.queue    = [];
                    this.batchFn(keys).then((values) => {
                        keys.forEach((k, i) => {
                            const result = values[i];
                            if (result instanceof Error) {
                                reject(result);
                            } else {
                                // Resolve all pending promises for this key
                                // (this approach works for single-request DataLoaders)
                            }
                        });
                    });
                });
            }
        });

        // Simpler flat approach: batch on next microtask
        return this.loadSingle(key);
    }

    private pendingBatch: Map<K, { resolve: (v: V) => void; reject: (e: Error) => void }> = new Map();
    private batchScheduled = false;

    loadSingle(key: K): Promise<V> {
        if (this.cache.has(key)) return this.cache.get(key)!;

        const promise = new Promise<V>((resolve, reject) => {
            this.pendingBatch.set(key, { resolve, reject });

            if (!this.batchScheduled) {
                this.batchScheduled = true;
                Promise.resolve().then(() => this.flush());
            }
        });

        this.cache.set(key, promise);
        return promise;
    }

    private async flush() {
        this.batchScheduled = false;
        const batch = new Map(this.pendingBatch);
        this.pendingBatch.clear();

        const keys   = Array.from(batch.keys());
        const values = await this.batchFn(keys);

        keys.forEach((key, i) => {
            const entry = batch.get(key)!;
            const value = values[i];
            if (value instanceof Error) {
                entry.reject(value);
                this.cache.delete(key);  // don't cache errors
            } else {
                entry.resolve(value);
            }
        });
    }

    clearAll() {
        this.cache.clear();
    }
}

// ── User Loader ────────────────────────────────────────────────────────────────

export function createUserLoader(db: SupabaseClient) {
    return new DataLoader<string, Record<string, unknown>>(async (ids) => {
        const { data, error } = await db
            .from("profiles")
            .select("id, username, display_name, avatar_url, bio, followers_count, following_count, posts_count, created_at")
            .in("id", ids as string[]);

        if (error) return ids.map(() => new Error(error.message));

        const byId = new Map((data ?? []).map((row: any) => [row.id, row]));
        return ids.map(id => byId.get(id) ?? new Error(`User ${id} not found`));
    });
}

// ── Post Loader ───────────────────────────────────────────────────────────────

export function createPostLoader(db: SupabaseClient) {
    return new DataLoader<string, Record<string, unknown>>(async (ids) => {
        const { data, error } = await db
            .from("posts")
            .select("id, content, image_urls, author_id, visibility, likes_count, comments_count, reposts_count, hashtags, created_at")
            .in("id", ids as string[]);

        if (error) return ids.map(() => new Error(error.message));

        const byId = new Map((data ?? []).map((row: any) => [row.id, row]));
        return ids.map(id => byId.get(id) ?? new Error(`Post ${id} not found`));
    });
}

// ── Comment Loader ─────────────────────────────────────────────────────────────

export function createCommentLoader(db: SupabaseClient) {
    return new DataLoader<string, Record<string, unknown>>(async (ids) => {
        const { data, error } = await db
            .from("comments")
            .select("id, content, author_id, post_id, likes_count, created_at")
            .in("id", ids as string[]);

        if (error) return ids.map(() => new Error(error.message));

        const byId = new Map((data ?? []).map((row: any) => [row.id, row]));
        return ids.map(id => byId.get(id) ?? new Error(`Comment ${id} not found`));
    });
}
