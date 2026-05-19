"use client";

import { useState } from "react";
import { useExplorePosts } from "@/lib/hooks/use-posts";
import { PostCard } from "@/components/feed/post-card";
import { PostSkeleton } from "@/components/feed/post-skeleton";
import { useToggleLike } from "@/lib/hooks/use-posts";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { TrendingHashtag } from "@/types";
import Link from "next/link";

interface Props { trendingHashtags: TrendingHashtag[] }

export function ExploreClient({ trendingHashtags }: Props) {
    const [query, setQuery] = useState("");
    const { data: posts, isLoading } = useExplorePosts();
    const { mutate: toggleLike } = useToggleLike();

    return (
        <div>
            {/* Search */}
            <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search FeedFlow"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Trending hashtags */}
            {trendingHashtags.length > 0 && (
                <div className="p-4 border-b border-border">
                    <h2 className="font-bold mb-3">Trending hashtags</h2>
                    <div className="flex flex-wrap gap-2">
                        {trendingHashtags.map((tag) => (
                            <Link
                                key={tag.id}
                                href={`/explore?q=%23${tag.tag}`}
                                className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                            >
                                #{tag.tag}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Posts */}
            {isLoading ? (
                <div className="divide-y divide-border">
                    {Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)}
                </div>
            ) : (
                <div className="divide-y divide-border">
                    {posts?.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUserId=""
                            onLike={(postId, liked) => toggleLike({ postId, liked, userId: "" })}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
