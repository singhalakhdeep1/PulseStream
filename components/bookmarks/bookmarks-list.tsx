"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { PostCard } from "@/components/feed/post-card";
import { PostSkeleton } from "@/components/feed/post-skeleton";
import { useToggleLike } from "@/lib/hooks/use-posts";
import { Bookmark } from "lucide-react";

interface Props { userId: string }

export function BookmarksList({ userId }: Props) {
    const supabase = createClient();
    const { mutate: toggleLike } = useToggleLike();

    const { data: posts, isLoading } = useQuery({
        queryKey: ["bookmarks", userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("bookmarks")
                .select(`
          post:posts!bookmarks_post_id_fkey(
            *,
            author:profiles!posts_author_id_fkey(*),
            media:post_media(*)
          )
        `)
                .eq("user_id", userId)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return (data ?? []).map((b: any) => b.post).filter(Boolean);
        },
        enabled: !!userId,
    });

    return (
        <div>
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                <Bookmark className="h-5 w-5" />
                <h1 className="text-lg font-bold">Bookmarks</h1>
            </div>

            {isLoading ? (
                <div className="divide-y divide-border">
                    {Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)}
                </div>
            ) : !posts || posts.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-muted-foreground">
                    <Bookmark className="h-12 w-12 mb-3 opacity-20" />
                    <p className="font-medium">No bookmarks yet</p>
                    <p className="text-sm mt-1">Save posts to read later</p>
                </div>
            ) : (
                <div className="divide-y divide-border">
                    {posts.map((post: any) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUserId={userId}
                            onLike={(postId, liked) => toggleLike({ postId, liked, userId })}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
