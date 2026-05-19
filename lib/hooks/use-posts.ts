"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Post, FeedCursor, PaginatedFeed } from "@/types";

const PAGE_SIZE = 20;

// ─── Feed (cursor-based pagination) ──────────────────────────────────────────
export function useFeed(userId: string | null) {
    return useInfiniteQuery<PaginatedFeed>({
        queryKey: ["feed", userId],
        queryFn: async ({ pageParam }) => {
            const cursor = pageParam as FeedCursor | null;
            const res = await fetch("/api/feed", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cursor, limit: PAGE_SIZE }),
            });
            if (!res.ok) throw new Error("Failed to fetch feed");
            return res.json();
        },
        initialPageParam: null,
        getNextPageParam: (last) => last.nextCursor ?? undefined,
        enabled: !!userId,
        staleTime: 1000 * 60,
    });
}

// ─── Explore (trending posts) ─────────────────────────────────────────────────
export function useExplorePosts() {
    const supabase = createClient();
    return useQuery({
        queryKey: ["explore"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("posts")
                .select(`
          *,
          author:profiles!posts_author_id_fkey(*),
          media:post_media(*)
        `)
                .eq("status", "active")
                .is("reply_to_id", null)
                .order("like_count", { ascending: false })
                .order("created_at", { ascending: false })
                .limit(50);
            if (error) throw error;
            return (data ?? []) as Post[];
        },
        staleTime: 1000 * 30,
    });
}

// ─── Single Post ──────────────────────────────────────────────────────────────
export function usePost(postId: string | null) {
    const supabase = createClient();
    return useQuery({
        queryKey: ["post", postId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("posts")
                .select(`*, author:profiles!posts_author_id_fkey(*), media:post_media(*)`)
                .eq("id", postId!)
                .single();
            if (error) throw error;
            return data as Post;
        },
        enabled: !!postId,
    });
}

// ─── Create Post ──────────────────────────────────────────────────────────────
export function useCreatePost() {
    const supabase = createClient();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({
            content,
            mediaUrls,
        }: { content: string; mediaUrls?: string[] }) => {
            const res = await fetch("/api/posts/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, mediaUrls }),
            });
            if (!res.ok) throw new Error("Failed to create post");
            return res.json();
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["feed"] });
        },
    });
}

// ─── Like / Unlike (optimistic) ───────────────────────────────────────────────
export function useToggleLike() {
    const supabase = createClient();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({ postId, liked }: { postId: string; liked: boolean; userId: string }) => {
            if (liked) {
                const { data: { user } } = await supabase.auth.getUser();
                await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user!.id);
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                await supabase.from("likes").insert({ post_id: postId, user_id: user!.id });
            }
        },
        onMutate: async ({ postId, liked }) => {
            await qc.cancelQueries({ queryKey: ["feed"] });
            // Optimistic update in feed
            const snap = qc.getQueriesData({ queryKey: ["feed"] });
            qc.setQueriesData({ queryKey: ["feed"] }, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages?.map((page: PaginatedFeed) => ({
                        ...page,
                        posts: page.posts.map((p) =>
                            p.id === postId
                                ? { ...p, like_count: p.like_count + (liked ? -1 : 1), is_liked: !liked }
                                : p
                        ),
                    })),
                };
            });
            return { snap };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.snap) {
                ctx.snap.forEach(([key, val]) => qc.setQueryData(key, val));
            }
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: ["feed"] });
        },
    });
}

// ─── Delete Post ──────────────────────────────────────────────────────────────
export function useDeletePost() {
    const supabase = createClient();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (postId: string) => {
            const { error } = await supabase.from("posts").delete().eq("id", postId);
            if (error) throw error;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["feed"] });
        },
    });
}

// ─── User Posts ───────────────────────────────────────────────────────────────
export function useUserPosts(userId: string | null) {
    const supabase = createClient();
    return useQuery({
        queryKey: ["user-posts", userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("posts")
                .select(`*, author:profiles!posts_author_id_fkey(*), media:post_media(*)`)
                .eq("author_id", userId!)
                .eq("status", "active")
                .is("reply_to_id", null)
                .order("created_at", { ascending: false })
                .limit(30);
            if (error) throw error;
            return (data ?? []) as Post[];
        },
        enabled: !!userId,
    });
}

// ─── Comments ─────────────────────────────────────────────────────────────────
export function useComments(postId: string | null) {
    const supabase = createClient();
    return useQuery({
        queryKey: ["comments", postId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("comments")
                .select(`*, author:profiles!comments_author_id_fkey(*)`)
                .eq("post_id", postId!)
                .is("parent_id", null)
                .order("created_at", { ascending: true });
            if (error) throw error;
            return data ?? [];
        },
        enabled: !!postId,
    });
}
