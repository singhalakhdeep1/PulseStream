"use client";

import { useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import {
    Home, Search, Bell, Mail, Bookmark, User,
    TrendingUp, Settings, Moon, Sun, LogOut
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface Props {
    username?: string;
}

export function FeedCommandPalette({ username }: Props) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { theme, setTheme } = useTheme();

    useHotkeys("mod+k", (e) => { e.preventDefault(); setOpen((o) => !o); }, { enableOnFormTags: true });
    useHotkeys("escape", () => setOpen(false), { enableOnFormTags: true });

    const navigate = (path: string) => { setOpen(false); router.push(path); };

    const commands = [
        { id: "home", label: "Home Feed", icon: <Home className="w-4 h-4" />, group: "Navigate", action: () => navigate("/feed") },
        { id: "explore", label: "Explore", icon: <TrendingUp className="w-4 h-4" />, group: "Navigate", action: () => navigate("/explore") },
        { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" />, group: "Navigate", action: () => navigate("/notifications") },
        { id: "messages", label: "Messages", icon: <Mail className="w-4 h-4" />, group: "Navigate", action: () => navigate("/messages") },
        { id: "bookmarks", label: "Bookmarks", icon: <Bookmark className="w-4 h-4" />, group: "Navigate", action: () => navigate("/bookmarks") },
        { id: "profile", label: "My Profile", icon: <User className="w-4 h-4" />, group: "Navigate", action: () => username ? navigate(`/${username}`) : undefined },
        { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" />, shortcut: "⌘,", group: "Account", action: () => navigate("/settings") },
        {
            id: "theme",
            label: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
            icon: theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
            group: "Account",
            action: () => { setOpen(false); setTheme(theme === "dark" ? "light" : "dark"); },
        },
    ];

    const groups = Array.from(new Set(commands.map((c) => c.group)));

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

            <div className="relative w-full max-w-md mx-4 rounded-2xl border border-border bg-background shadow-2xl overflow-hidden">
                <Command>
                    <div className="flex items-center border-b border-border px-3 gap-2">
                        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                        <Command.Input
                            className="flex h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            placeholder="Search FeedFlow…"
                            autoFocus
                        />
                    </div>

                    <Command.List className="max-h-72 overflow-y-auto p-2">
                        <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                            No results found.
                        </Command.Empty>

                        {groups.map((group) => (
                            <Command.Group key={group} heading={group}
                                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground"
                            >
                                {commands
                                    .filter((c) => c.group === group)
                                    .map((cmd) => (
                                        <Command.Item
                                            key={cmd.id}
                                            value={cmd.label}
                                            onSelect={cmd.action}
                                            className={cn(
                                                "flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm cursor-pointer",
                                                "aria-selected:bg-accent transition-colors"
                                            )}
                                        >
                                            {cmd.icon}
                                            <span className="flex-1">{cmd.label}</span>
                                            {"shortcut" in cmd && cmd.shortcut && (
                                                <kbd className="text-[10px] text-muted-foreground">{cmd.shortcut}</kbd>
                                            )}
                                        </Command.Item>
                                    ))}
                            </Command.Group>
                        ))}
                    </Command.List>
                </Command>
            </div>
        </div>
    );
}
