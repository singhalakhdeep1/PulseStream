import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
    if (!name?.trim()) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 60) return "just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
    if (isToday(date)) return format(date, "'Today at' h:mm a");
    if (isYesterday(date)) return format(date, "'Yesterday at' h:mm a");
    return format(date, "MMM d, yyyy");
}

export function formatShortTime(dateString: string): string {
    const date = new Date(dateString);
    const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSec < 60) return "now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d`;
    return format(date, "MMM d");
}

export function formatCount(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

export function generateUsername(fullName: string): string {
    return fullName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "")
        .slice(0, 20);
}

export function extractHashtags(text: string): string[] {
    const matches = text.match(/#[\w]+/g) ?? [];
    return [...new Set(matches.map((t) => t.slice(1).toLowerCase()))];
}

export function extractMentions(text: string): string[] {
    const matches = text.match(/@[\w]+/g) ?? [];
    return [...new Set(matches.map((t) => t.slice(1).toLowerCase()))];
}

export function highlightText(text: string): string {
    return text
        .replace(/#([\w]+)/g, '<span class="text-primary font-medium">#$1</span>')
        .replace(/@([\w]+)/g, '<span class="text-primary font-medium">@$1</span>');
}

export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + "…";
}

export function cloudflareImageUrl(hash: string, imageId: string, variant = "public"): string {
    return `https://imagedelivery.net/${hash}/${imageId}/${variant}`;
}
