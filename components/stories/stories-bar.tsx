"use client";

import { useStories } from "@/lib/hooks/use-stories";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from "next/link";

interface Props { userId: string }

export function StoriesBar({ userId }: Props) {
    const { data: stories } = useStories(userId);
    if (!stories || stories.length === 0) return null;

    // Group by author
    const byAuthor = stories.reduce<Record<string, typeof stories[0]>>((acc, s) => {
        if (!acc[s.author_id]) acc[s.author_id] = s;
        return acc;
    }, {});
    const grouped = Object.values(byAuthor);

    return (
        <div className="p-4 border-b border-border">
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex items-center gap-4 pb-1">
                    {grouped.map((story) => (
                        <Link
                            key={story.id}
                            href={`/stories/${story.author_id}`}
                            className="flex flex-col items-center gap-1.5 shrink-0 group"
                        >
                            <div className={`p-[2px] rounded-full ${story.is_viewed ? "bg-border" : "story-ring"}`}>
                                <div className="bg-background rounded-full p-[2px]">
                                    <Avatar className="h-14 w-14">
                                        <AvatarImage src={story.author?.avatar_url ?? undefined} />
                                        <AvatarFallback className="text-xs">
                                            {getInitials(story.author?.full_name ?? "?")}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>
                            <span className="text-[11px] text-muted-foreground max-w-[56px] truncate group-hover:text-foreground transition-colors">
                                {story.author?.username}
                            </span>
                        </Link>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
