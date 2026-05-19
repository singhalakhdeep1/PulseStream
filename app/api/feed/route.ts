import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { FeedCursor } from "@/types";

const PAGE_SIZE = 20;

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const cursor: FeedCursor | null = body.cursor ?? null;
    const limit = Math.min(body.limit ?? PAGE_SIZE, 50);

    // Cursor-based pagination on feed_items using (created_at, post_id) tuple
    let query = supabase
        .from("feed_items")
        .select(`
      created_at,
      post_id,
      post:posts!feed_items_post_id_fkey(
        *,
        author:profiles!posts_author_id_fkey(
          id, username, full_name, avatar_url, avatar_blurhash, is_verified
        ),
        media:post_media(*)
      )
    `)
        .eq("user_id", user.id)
        .eq("post.status", "active")
        .order("created_at", { ascending: false })
        .order("post_id", { ascending: false })
        .limit(limit + 1);

    if (cursor) {
        // Keyset pagination: created_at < cursor.created_at OR (created_at = cursor.created_at AND post_id < cursor.post_id)
        query = query.or(
            `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},post_id.lt.${cursor.post_id})`
        );
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const rows = (data ?? []).filter((row: any) => !!row.post);
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const posts = items.map((row: any) => row.post);

    const nextCursor: FeedCursor | null = hasMore
        ? { created_at: items[items.length - 1].created_at, post_id: items[items.length - 1].post_id }
        : null;

    return NextResponse.json({ posts, nextCursor, hasMore });
}
