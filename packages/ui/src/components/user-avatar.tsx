"use client";
import * as React from "react";
import { cn } from "../utils";
import type { AuthUser } from "@feedflow/types";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";

interface UserAvatarProps {
    user: Pick<AuthUser, "displayName" | "avatarUrl" | "username">;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeMap = { sm: "h-7 w-7 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-base" };

export function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
    const initials = user.displayName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <Avatar className={cn(sizeMap[size], className)}>
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.displayName} />}
            <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
    );
}
