"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Bell, User, Bookmark, Search, Settings, LogOut } from "lucide-react";
import type { AuthUser } from "@feedflow/types";
import { UserAvatar, Button, cn } from "@feedflow/ui";
import { signOut } from "@feedflow/auth/client";
import dynamic from "next/dynamic";

// Notification badge loaded from notifications MFE
const NotificationsBadge = dynamic(() => import("notifications_mfe/NotificationsBell"), {
    loading: () => <Bell className="h-5 w-5" />,
    ssr: false,
});

// Messages badge loaded from messages MFE
const MessagesBadge = dynamic(() => import("messages_mfe/MessagesBadge"), {
    loading: () => <MessageCircle className="h-5 w-5" />,
    ssr: false,
});

const NAV_ITEMS = [
    { href: "/feed",          label: "Home",          icon: Home },
    { href: "/explore",       label: "Explore",       icon: Search },
    { href: "/messages",      label: "Messages",      icon: null,         badge: MessagesBadge },
    { href: "/notifications", label: "Notifications", icon: null,         badge: NotificationsBadge },
    { href: "/bookmarks",     label: "Bookmarks",     icon: Bookmark },
    { href: "/settings",      label: "Settings",      icon: Settings },
] as const;

interface NavSidebarProps { user: AuthUser }

export function NavSidebar({ user }: NavSidebarProps) {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col h-full">
            {/* Logo */}
            <Link href="/feed" className="flex items-center gap-2 px-3 py-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">F</div>
                <span className="font-bold text-lg">FeedFlow</span>
            </Link>

            {/* Nav links */}
            <ul className="space-y-1 flex-1">
                {NAV_ITEMS.map(({ href, label, icon: Icon, badge: Badge }) => {
                    const active = pathname === href || pathname.startsWith(href + "/");
                    return (
                        <li key={href}>
                            <Link
                                href={href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    active
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                {Badge ? <Badge /> : Icon && <Icon className="h-5 w-5 shrink-0" />}
                                {label}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            {/* User footer */}
            <div className="mt-auto pt-4 border-t border-border">
                <Link href={`/profile/${user.username}`} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                    <UserAvatar user={user} size="sm" />
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                    </div>
                </Link>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-1 justify-start gap-2 text-muted-foreground"
                    onClick={() => signOut()}
                >
                    <LogOut className="h-4 w-4" />
                    Sign out
                </Button>
            </div>
        </nav>
    );
}
