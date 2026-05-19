"use client";

import { usePost, useComments } from "@/lib/hooks/use-posts";
import { PostCard } from "./post-card";
import { PostSkeleton } from "./post-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import type { Post } from "@/types";

interface Props { post: Post }

export function PostThread({ post }: Props) {
    const { data: comments, isLoading } = useComments(post.id);

    return (
        <div>
            {/* Main post */}
            <PostCard post={post} currentUserId="" onLike={() => { }} />

            {/* Comments */}
            <div className="border-t border-border">
                <p className="px-4 py-3 text-sm font-semibold text-muted-foreground">
                    {post.comment_count} replies
                </p>
                {isLoading ? (
                    <PostSkeleton />
                ) : (
                    comments?.map((comment) => (
                        <div key={comment.id} className="flex gap-3 p-4 border-b border-border hover:bg-muted/30 transition-colors">
                            <Avatar className="h-9 w-9 shrink-0">
                                <AvatarImage src={comment.author?.avatar_url ?? undefined} />
                                <AvatarFallback>{getInitials(comment.author?.full_name ?? "?")}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                    <span className="text-sm font-semibold">{comment.author?.full_name}</span>
                                    <span className="text-xs text-muted-foreground">@{comment.author?.username}</span>
                                    <span className="text-xs text-muted-foreground">·</span>
                                    <span className="text-xs text-muted-foreground">{formatRelativeTime(comment.created_at)}</span>
                                </div>
                                <p className="text-sm mt-1 break-words">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
