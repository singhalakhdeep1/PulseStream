"use client";
// ─── NotificationsDropdown — exposed by notifications_mfe ─────────────────────

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { UserAvatar } from "@feedflow/ui";
import { Bell, Heart, MessageCircle, UserPlus, Repeat2, AtSign } from "lucide-react";
import type { Notification, NotificationType } from "@feedflow/types";
import { gqlFetch } from "../lib/gql-client";
import { formatDistanceToNow } from "date-fns";

const RECENT_NOTIFICATIONS_QUERY = `
    query RecentNotifications {
        notifications(first: 5) {
            edges { node {
                id type isRead createdAt
                actor { id username displayName avatarUrl }
                post { id content }
            }}
        }
    }
`;

const ICON_MAP: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
    like: Heart, comment: MessageCircle, follow: UserPlus, repost: Repeat2, mention: AtSign,
};

const TYPE_TEXT: Record<NotificationType, string> = {
    like: "liked your post", comment: "commented", follow: "followed you", repost: "reposted", mention: "mentioned you",
};

interface NotificationsDropdownProps {
    open: boolean;
    onClose: () => void;
}

export default function NotificationsDropdown({ open, onClose }: NotificationsDropdownProps) {
    const { data } = useQuery({
        queryKey: ["notifications-recent"],
        queryFn: () => gqlFetch<{ notifications: { edges: Array<{ node: Notification }> } }>(RECENT_NOTIFICATIONS_QUERY),
        enabled: open,
    });

    const notifications = data?.notifications.edges.map((e) => e.node) ?? [];

    if (!open) return null;

    return (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-background shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                <span className="text-sm font-semibold">Notifications</span>
                <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">Close</button>
            </div>
            {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">No new notifications</div>
            ) : (
                <ul className="divide-y divide-border">
                    {notifications.map((notif) => {
                        const Icon = ICON_MAP[notif.type] ?? Bell;
                        return (
                            <li key={notif.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
                                <div className="relative shrink-0">
                                    {notif.actor && <UserAvatar user={notif.actor} size="sm" />}
                                    <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                                        <Icon className="h-2 w-2 text-primary-foreground" />
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs">
                                        <span className="font-semibold">{notif.actor?.displayName}</span>{" "}
                                        {TYPE_TEXT[notif.type]}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                    </p>
                                </div>
                                {!notif.isRead && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
