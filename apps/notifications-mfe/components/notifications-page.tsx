"use client";
// ─── NotificationsPage — exposed by notifications_mfe ─────────────────────────

import * as React from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner, UserAvatar, Button, EmptyState } from "@feedflow/ui";
import { Bell, Heart, MessageCircle, UserPlus, Repeat2, AtSign } from "lucide-react";
import type { Notification, NotificationType } from "@feedflow/types";
import { gqlFetch } from "../lib/gql-client";
import { formatDistanceToNow } from "date-fns";

const NOTIFICATIONS_QUERY = `
    query Notifications($after: String) {
        notifications(after: $after, first: 20) {
            edges { node {
                id type isRead createdAt
                actor { id username displayName avatarUrl }
                post { id content }
            }}
            pageInfo { hasNextPage endCursor }
        }
    }
`;

const MARK_ALL_READ_MUTATION = `
    mutation MarkAllNotificationsRead { markAllNotificationsRead }
`;

const MARK_READ_MUTATION = `
    mutation MarkNotificationRead($id: ID!) { markNotificationRead(id: $id) { id isRead } }
`;

const ICON_MAP: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
    like:    Heart,
    comment: MessageCircle,
    follow:  UserPlus,
    repost:  Repeat2,
    mention: AtSign,
};

const TYPE_TEXT: Record<NotificationType, string> = {
    like:    "liked your post",
    comment: "commented on your post",
    follow:  "followed you",
    repost:  "reposted your post",
    mention: "mentioned you",
};

export default function NotificationsPage() {
    const queryClient = useQueryClient();

    const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
        queryKey: ["notifications"],
        queryFn: ({ pageParam }) => gqlFetch<{
            notifications: {
                edges: Array<{ node: Notification }>;
                pageInfo: { hasNextPage: boolean; endCursor?: string };
            }
        }>(NOTIFICATIONS_QUERY, { after: pageParam }),
        getNextPageParam: (last) => last.notifications.pageInfo.hasNextPage ? last.notifications.pageInfo.endCursor : undefined,
        initialPageParam: undefined as string | undefined,
    });

    const markAllRead = useMutation({
        mutationFn: () => gqlFetch(MARK_ALL_READ_MUTATION),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });

    const markRead = useMutation({
        mutationFn: (id: string) => gqlFetch(MARK_READ_MUTATION, { id }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });

    const notifications = data?.pages.flatMap((p) => p.notifications.edges.map((e) => e.node)) ?? [];

    return (
        <div className="flex flex-col h-full">
            <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
                <h1 className="text-lg font-bold">Notifications</h1>
                {notifications.some((n) => !n.isRead) && (
                    <Button variant="ghost" size="sm" onClick={() => markAllRead.mutate()}>
                        Mark all read
                    </Button>
                )}
            </div>

            {isLoading && (
                <div className="flex items-center justify-center py-16"><Spinner className="h-8 w-8" /></div>
            )}

            {!isLoading && notifications.length === 0 && (
                <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
            )}

            <ul className="flex-1 overflow-y-auto divide-y divide-border">
                {notifications.map((notif) => {
                    const Icon = ICON_MAP[notif.type] ?? Bell;
                    return (
                        <li
                            key={notif.id}
                            className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer ${!notif.isRead ? "bg-primary/5" : ""}`}
                            onClick={() => !notif.isRead && markRead.mutate(notif.id)}
                        >
                            <div className="relative shrink-0">
                                {notif.actor && <UserAvatar user={notif.actor} size="sm" />}
                                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                    <Icon className="h-2.5 w-2.5 text-primary-foreground" />
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm">
                                    <span className="font-semibold">{notif.actor?.displayName}</span>{" "}
                                    {TYPE_TEXT[notif.type]}
                                </p>
                                {notif.post && (
                                    <p className="text-xs text-muted-foreground truncate mt-0.5">{notif.post.content}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                            {!notif.isRead && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                        </li>
                    );
                })}
            </ul>

            {hasNextPage && (
                <div className="flex justify-center py-4">
                    <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                        {isFetchingNextPage ? <Spinner className="h-4 w-4" /> : "Load more"}
                    </Button>
                </div>
            )}
        </div>
    );
}
