"use client";
// ─── MessagesBadge — exposed by messages_mfe ─────────────────────────────────
// Shows the inbox icon with an unread count badge in the shell's nav.

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { gqlFetch } from "../lib/gql-client";

const UNREAD_QUERY = `
    query UnreadMessages {
        conversations { id unreadCount }
    }
`;

export default function MessagesBadge() {
    const { data } = useQuery({
        queryKey: ["messages-unread-count"],
        queryFn: () => gqlFetch<{ conversations: Array<{ unreadCount: number }> }>(UNREAD_QUERY),
        refetchInterval: 30_000,
    });

    const unread = data?.conversations.reduce((acc, c) => acc + c.unreadCount, 0) ?? 0;

    return (
        <span className="relative inline-flex items-center">
            <MessageCircle className="h-5 w-5" />
            {unread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                </span>
            )}
        </span>
    );
}
