"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, MessageCircle, Repeat2, Bookmark, MoreHorizontal, Share } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatShortTime, formatCount, getInitials, highlightText } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import type { Post } from "@/types";

interface Props {
    post: Post;
    currentUserId: string;
    onLike: (postId: string, liked: boolean) => void;
}

export function PostCard({ post, currentUserId, onLike }: Props) {
    const [liked, setLiked] = useState(post.is_liked ?? false);
    const [likeCount, setLikeCount] = useState(post.like_count);

    const handleLike = () => {
        const next = !liked;
        setLiked(next);
        setLikeCount((c) => c + (next ? 1 : -1));
        onLike(post.id, liked);
    };

    const author = post.author;

    return (
        <article className="flex gap-3 p-4 hover:bg-muted/30 transition-colors">
            {/* Avatar */}
            <Link href={`/${author?.username}`} className="shrink-0">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={author?.avatar_url ?? undefined} alt={author?.username} />
                    <AvatarFallback>{getInitials(author?.full_name ?? "?")}</AvatarFallback>
                </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-1 flex-wrap">
                    <Link href={`/${author?.username}`} className="font-semibold hover:underline text-sm">
                        {author?.full_name}
                    </Link>
                    <span className="text-muted-foreground text-sm">@{author?.username}</span>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="text-muted-foreground text-xs">{formatShortTime(post.created_at)}</span>
                </div>

                {/* Content */}
                <Link href={`/posts/${post.id}`} className="block mt-1">
                    <p
                        className="text-sm leading-relaxed break-words"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(highlightText(post.content)) }}
                    />
                </Link>

                {/* Media */}
                {post.media && post.media.length > 0 && (
                    <div className={`mt-3 grid gap-1 rounded-xl overflow-hidden ${post.media.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                        {post.media.map((m) => (
                            <div
                                key={m.id}
                                className="relative bg-muted aspect-video"
                                style={{ backgroundColor: "#1a1a1a" }}
                            >
                                {m.media_type === "image" || m.media_type === "gif" ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={m.url}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <video src={m.url} className="w-full h-full object-cover" controls />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-5 mt-3 -ml-1">
                    {/* Like */}
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 text-xs group transition-colors ${liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
                    >
                        <Heart className={`h-4 w-4 transition-transform group-hover:scale-110 ${liked ? "fill-current" : ""}`} />
                        <span>{formatCount(likeCount)}</span>
                    </button>

                    {/* Comment */}
                    <Link
                        href={`/posts/${post.id}`}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                        <MessageCircle className="h-4 w-4" />
                        <span>{formatCount(post.comment_count)}</span>
                    </Link>

                    {/* Repost */}
                    <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-green-500 transition-colors">
                        <Repeat2 className="h-4 w-4" />
                        <span>{formatCount(post.repost_count)}</span>
                    </button>

                    {/* Bookmark */}
                    <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors ml-auto">
                        <Bookmark className={`h-4 w-4 ${post.is_bookmarked ? "fill-current text-primary" : ""}`} />
                    </button>
                </div>
            </div>
        </article>
    );
}
