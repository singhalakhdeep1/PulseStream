"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useFeed, useToggleLike } from "@/lib/hooks/use-posts";
import { useRealtimeFeed } from "@/lib/hooks/use-realtime";
import { PostCard } from "./post-card";
import { PostSkeleton } from "./post-skeleton";

interface Props { userId: string }

export function FeedList({ userId }: Props) {
    useRealtimeFeed(userId);
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeed(userId);
    const { mutate: toggleLike } = useToggleLike();

    // react-intersection-observer — cleaner than manual IntersectionObserver ref
    const { ref: sentinelRef, inView } = useInView({
        threshold: 0,
        rootMargin: "200px",
    });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isLoading) {
        return (
            <div className="divide-y divide-border">
                {Array.from({ length: 5 }).map((_, i) => <PostSkeleton key={i} />)}
            </div>
        );
    }

    const posts = data?.pages.flatMap((p) => p.posts) ?? [];

    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <p className="text-lg font-medium">Your feed is empty</p>
                <p className="text-sm mt-1">Follow people to see their posts here</p>
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
            {isFetchingNextPage && <PostSkeleton />}
            {/* Sentinel for infinite scroll */}
            {hasNextPage && <div ref={sentinelRef} className="h-1" />}
            {!hasNextPage && posts.length > 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">You&apos;re all caught up!</p>
            )}
        </div>
    );
}
