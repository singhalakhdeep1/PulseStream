"use client";
// ─── FeedPage — exposed by feed_mfe ─────────────────────────────────────────
// This is the primary component the shell loads at /feed.
// Uses the shared GraphQL BFF via useGraphQL hook.

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { PostCard, Spinner, EmptyState, Button } from "@feedflow/ui";
import { Home } from "lucide-react";
import type { Post, FeedAlgorithm } from "@feedflow/types";
import { gqlFetch } from "../lib/gql-client";
import { CreatePostModal } from "./create-post-modal";

const FEED_QUERY = `
    query Feed($algorithm: FeedAlgorithm, $after: String, $first: Int) {
        feed(algorithm: $algorithm, after: $after, first: $first) {
            posts {
                id authorId content imageUrls hashtags
                likesCount commentsCount repostsCount
                isLiked isBookmarked isRepost
                createdAt updatedAt
                author {
                    id username displayName avatarUrl isVerified
                }
            }
            hasNextPage nextCursor totalCount
        }
    }
`;

const LIKE_MUTATION = `
    mutation LikePost($postId: ID!) { likePost(postId: $postId) { id likesCount isLiked } }
`;
const UNLIKE_MUTATION = `
    mutation UnlikePost($postId: ID!) { unlikePost(postId: $postId) { id likesCount isLiked } }
`;
const BOOKMARK_MUTATION = `
    mutation BookmarkPost($postId: ID!) { bookmarkPost(postId: $postId) { id isBookmarked } }
`;
const UNBOOKMARK_MUTATION = `
    mutation UnbookmarkPost($postId: ID!) { unbookmarkPost(postId: $postId) { id isBookmarked } }
`;

interface FeedPageProps {
    algorithm?: FeedAlgorithm;
}

export default function FeedPage({ algorithm = "RANKED" }: FeedPageProps) {
    const [createOpen, setCreateOpen] = React.useState(false);
    const [selectedAlgorithm, setSelectedAlgorithm] = React.useState<FeedAlgorithm>(algorithm);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteQuery({
        queryKey: ["feed", selectedAlgorithm],
        queryFn: async ({ pageParam }) => {
            const result = await gqlFetch<{ feed: { posts: Post[]; hasNextPage: boolean; nextCursor?: string } }>(
                FEED_QUERY,
                { algorithm: selectedAlgorithm, after: pageParam, first: 20 }
            );
            return result.feed;
        },
        getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.nextCursor : undefined,
        initialPageParam: undefined as string | undefined,
    });

    const posts = data?.pages.flatMap((p) => p.posts) ?? [];

    const handleLike = async (postId: string, currentlyLiked: boolean) => {
        await gqlFetch(currentlyLiked ? UNLIKE_MUTATION : LIKE_MUTATION, { postId });
    };

    const handleBookmark = async (postId: string, currentlyBookmarked: boolean) => {
        await gqlFetch(currentlyBookmarked ? UNBOOKMARK_MUTATION : BOOKMARK_MUTATION, { postId });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold">Home</h1>
                    {/* Algorithm picker */}
                    <div className="flex gap-1">
                        {(["RANKED", "CHRONOLOGICAL", "FOLLOWING"] as FeedAlgorithm[]).map((algo) => (
                            <button
                                key={algo}
                                onClick={() => setSelectedAlgorithm(algo)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                    selectedAlgorithm === algo
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted"
                                }`}
                            >
                                {algo === "RANKED" ? "For You" : algo === "CHRONOLOGICAL" ? "Latest" : "Following"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create post prompt */}
            <div className="border-b border-border p-4">
                <button
                    onClick={() => setCreateOpen(true)}
                    className="w-full text-left text-muted-foreground text-sm bg-muted/40 rounded-full px-4 py-2.5 hover:bg-muted transition-colors"
                >
                    What's on your mind?
                </button>
            </div>

            {/* Feed */}
            <div className="flex-1">
                {isLoading && (
                    <div className="flex items-center justify-center py-16">
                        <Spinner className="h-8 w-8" />
                    </div>
                )}

                {isError && (
                    <EmptyState
                        icon={Home}
                        title="Failed to load feed"
                        description="Something went wrong. Please try again."
                        action={<Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>}
                    />
                )}

                {!isLoading && posts.length === 0 && (
                    <EmptyState
                        icon={Home}
                        title="Your feed is empty"
                        description="Follow some people to see their posts here."
                    />
                )}

                {posts.map((post) => (
                    <PostCard
                        key={post.id}
                        post={post}
                        onLike={(id) => handleLike(id, !!post.isLiked)}
                        onBookmark={(id) => handleBookmark(id, !!post.isBookmarked)}
                    />
                ))}

                {/* Load more */}
                {hasNextPage && (
                    <div className="flex justify-center py-4">
                        <Button
                            variant="outline"
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                        >
                            {isFetchingNextPage ? <Spinner className="h-4 w-4" /> : "Load more"}
                        </Button>
                    </div>
                )}
            </div>

            <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} />
        </div>
    );
}
