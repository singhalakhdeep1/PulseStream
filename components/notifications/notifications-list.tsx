"use client";

import { useNotifications, useMarkAllNotificationsRead } from "@/lib/hooks/use-notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatShortTime, getInitials } from "@/lib/utils";
import { Heart, MessageCircle, UserPlus, AtSign } from "lucide-react";
import type { Notification } from "@/types";

const ICONS: Record<string, React.ElementType> = {
    like: Heart,
    comment: MessageCircle,
    follow: UserPlus,
    mention: AtSign,
    reply: MessageCircle,
};

interface Props { userId: string }

export function NotificationsList({ userId }: Props) {
    const { data: notifications, isLoading } = useNotifications(userId);
    const { mutate: markAll } = useMarkAllNotificationsRead();

    if (isLoading) {
        return (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading notifications…</div>
        );
    }

    if (!notifications || notifications.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <p className="text-base font-medium">No notifications yet</p>
                <p className="text-sm mt-1">When people interact with your posts, you&apos;ll see it here</p>
            </div>
        );
    }

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <div>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h1 className="text-lg font-bold">Notifications</h1>
                {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => markAll(userId)}>
                        Mark all read
                    </Button>
                )}
            </div>

            <div className="divide-y divide-border">
                {notifications.map((n) => (
                    <NotificationRow key={n.id} notification={n} />
                ))}
            </div>
        </div>
    );
}

function NotificationRow({ notification: n }: { notification: Notification }) {
    const Icon = ICONS[n.type] ?? Heart;
    const messages: Record<string, string> = {
        like: "liked your post",
        comment: "commented on your post",
        follow: "followed you",
        mention: "mentioned you",
        reply: "replied to your comment",
    };

    return (
        <div className={`flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors ${!n.is_read ? "bg-primary/5" : ""}`}>
            <div className="relative shrink-0">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={n.actor?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">{getInitials(n.actor?.full_name ?? "?")}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background flex items-center justify-center">
                    <Icon className="h-3 w-3 text-primary" />
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm">
                    <strong>@{n.actor?.username}</strong> {messages[n.type] ?? "interacted with you"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatShortTime(n.created_at)}</p>
            </div>
            {!n.is_read && (
                <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
            )}
        </div>
    );
}
