"use client";

import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useConversations } from "@/lib/hooks/use-messages";
import { getInitials, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
    currentUserId: string;
}

export function ConversationList({ currentUserId }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const { data: conversations = [], isLoading } = useConversations(currentUserId);

    if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Loading…</div>;

    return (
        <div className="border-r border-border h-full overflow-y-auto">
            <div className="p-4 font-semibold border-b border-border">Messages</div>
            {conversations.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
            )}
            {conversations.map((c) => (
                <button
                    key={c.id}
                    onClick={() => router.push(`/messages/${c.id}`)}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors text-left",
                        pathname === `/messages/${c.id}` && "bg-accent"
                    )}
                >
                    <Avatar className="w-10 h-10 shrink-0">
                        <AvatarImage src={c.other_avatar_url ?? undefined} />
                        <AvatarFallback>{getInitials(c.other_username)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">@{c.other_username}</div>
                        <div className="text-xs text-muted-foreground truncate">{c.last_message ?? "No messages yet"}</div>
                    </div>
                    {c.last_message_at && (
                        <span className="text-xs text-muted-foreground shrink-0">{formatRelativeTime(new Date(c.last_message_at))}</span>
                    )}
                </button>
            ))}
        </div>
    );
}
