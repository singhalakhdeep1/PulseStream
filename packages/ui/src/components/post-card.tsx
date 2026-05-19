"use client";
import * as React from "react";
import { Heart, MessageCircle, Repeat2, Bookmark, MoreHorizontal } from "lucide-react";
import type { Post } from "@feedflow/types";
import { cn } from "../utils";
import { UserAvatar } from "./user-avatar";
import { Button } from "./button";

interface PostCardProps {
    post: Post;
    onLike?: (postId: string) => void;
    onComment?: (postId: string) => void;
    onRepost?: (postId: string) => void;
    onBookmark?: (postId: string) => void;
    className?: string;
}

export function PostCard({ post, onLike, onComment, onRepost, onBookmark, className }: PostCardProps) {
    const author = post.author;

    return (
        <article className={cn("flex gap-3 border-b border-border p-4 hover:bg-muted/30 transition-colors", className)}>
            {/* Avatar */}
            {author && <UserAvatar user={author} size="md" className="shrink-0 mt-0.5" />}

            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                        {author && (
                            <>
                                <span className="font-semibold text-sm truncate">{author.displayName}</span>
                                <span className="text-muted-foreground text-sm">@{author.username}</span>
                            </>
                        )}
                        <span className="text-muted-foreground text-sm">·</span>
                        <time className="text-muted-foreground text-sm shrink-0">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </time>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <p className="text-sm leading-relaxed mt-1 whitespace-pre-wrap break-words">{post.content}</p>

                {/* Images */}
                {post.imageUrls.length > 0 && (
                    <div className={cn("mt-3 grid gap-2", post.imageUrls.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
                        {post.imageUrls.map((url, i) => (
                            <img
                                key={i}
                                src={url}
                                alt=""
                                className="rounded-lg object-cover w-full max-h-64"
                                loading="lazy"
                            />
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 mt-3 -ml-1.5">
                    <button
                        onClick={() => onComment?.(post.id)}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-primary text-sm transition-colors group"
                    >
                        <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        {post.commentsCount > 0 && post.commentsCount}
                    </button>
                    <button
                        onClick={() => onRepost?.(post.id)}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-green-500 text-sm transition-colors group"
                    >
                        <Repeat2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        {post.repostsCount > 0 && post.repostsCount}
                    </button>
                    <button
                        onClick={() => onLike?.(post.id)}
                        className={cn(
                            "flex items-center gap-1.5 text-sm transition-colors group",
                            post.isLiked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                        )}
                    >
                        <Heart className={cn("h-4 w-4 group-hover:scale-110 transition-transform", post.isLiked && "fill-current")} />
                        {post.likesCount > 0 && post.likesCount}
                    </button>
                    <button
                        onClick={() => onBookmark?.(post.id)}
                        className={cn(
                            "flex items-center gap-1.5 text-sm transition-colors group ml-auto",
                            post.isBookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"
                        )}
                    >
                        <Bookmark className={cn("h-4 w-4 group-hover:scale-110 transition-transform", post.isBookmarked && "fill-current")} />
                    </button>
                </div>
            </div>
        </article>
    );
}
