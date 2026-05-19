"use client";
// ─── FeedWidget — exposed by feed_mfe ────────────────────────────────────────
// Compact feed preview used in sidebars or dashboards.

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { PostCard, Spinner, LoadingSkeleton } from "@feedflow/ui";
import type { Post } from "@feedflow/types";
import { gqlFetch } from "../lib/gql-client";

const WIDGET_QUERY = `
    query FeedWidget($first: Int) {
        feed(first: $first) {
            posts { id authorId content likesCount commentsCount createdAt author { id username displayName avatarUrl } }
        }
    }
`;

interface FeedWidgetProps { limit?: number }

export default function FeedWidget({ limit = 5 }: FeedWidgetProps) {
    const { data, isLoading } = useQuery({
        queryKey: ["feed-widget", limit],
        queryFn: () => gqlFetch<{ feed: { posts: Post[] } }>(WIDGET_QUERY, { first: limit }),
    });

    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: limit }).map((_, i) => (
                    <LoadingSkeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        );
    }

    return (
        <div className="divide-y divide-border">
            {data?.feed.posts.map((post) => (
                <PostCard key={post.id} post={post} className="py-2 px-0 text-xs" />
            ))}
        </div>
    );
}
