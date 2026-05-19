"use client";
// ─── NotificationsBell — exposed by notifications_mfe ─────────────────────────
// Renders in the shell nav. Shows unread count badge.

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { gqlFetch } from "../lib/gql-client";

const UNREAD_COUNT_QUERY = `
    query UnreadCount { unreadNotificationCount }
`;

export default function NotificationsBell() {
    const { data } = useQuery({
        queryKey: ["notifications-unread"],
        queryFn: () => gqlFetch<{ unreadNotificationCount: number }>(UNREAD_COUNT_QUERY),
        refetchInterval: 30_000,
    });

    const count = data?.unreadNotificationCount ?? 0;

    return (
        <span className="relative inline-flex items-center">
            <Bell className="h-5 w-5" />
            {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                </span>
            )}
        </span>
    );
}
