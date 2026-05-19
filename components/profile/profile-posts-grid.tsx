"use client";

import { useUserPosts } from "@/lib/hooks/use-posts";
import { PostCard } from "@/components/feed/post-card";
import { PostSkeleton } from "@/components/feed/post-skeleton";
import { useToggleLike } from "@/lib/hooks/use-posts";

interface Props { userId: string }

export function ProfilePostsGrid({ userId }: Props) {
    const { data: posts, isLoading } = useUserPosts(userId);
    const { mutate: toggleLike } = useToggleLike();

    if (isLoading) return <PostSkeleton />;
    if (!posts || posts.length === 0) {
        return (
            <div className="flex flex-col items-center py-16 text-muted-foreground">
                <p className="text-base">No posts yet</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-border">
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={userId}
                    onLike={(postId, liked) => toggleLike({ postId, liked, userId })}
                />
            ))}
        </div>
    );
}
