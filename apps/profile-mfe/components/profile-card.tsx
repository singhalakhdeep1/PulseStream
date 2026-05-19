"use client";
// ─── ProfileCard — exposed by profile_mfe ─────────────────────────────────────
// Compact profile summary card used in sidebars and suggestions.

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { UserAvatar, Button, LoadingSkeleton } from "@feedflow/ui";
import { gqlFetch } from "../lib/gql-client";

const PROFILE_CARD_QUERY = `
    query ProfileCard($userId: ID!) {
        userById(id: $userId) {
            id username displayName bio avatarUrl isVerified isFollowing followersCount
        }
    }
`;

interface ProfileCardProps { userId: string }

export default function ProfileCard({ userId }: ProfileCardProps) {
    const { data, isLoading } = useQuery({
        queryKey: ["profile-card", userId],
        queryFn: () => gqlFetch<{ userById: any }>(PROFILE_CARD_QUERY, { userId }),
    });

    if (isLoading) return <LoadingSkeleton className="h-24 w-full rounded-xl" />;

    const user = data?.userById;
    if (!user) return null;

    return (
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <UserAvatar user={user} size="md" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                </div>
            </div>
            {user.bio && <p className="text-xs text-muted-foreground line-clamp-2">{user.bio}</p>}
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{user.followersCount} followers</span>
                <Button size="sm" variant={user.isFollowing ? "outline" : "default"}>
                    {user.isFollowing ? "Following" : "Follow"}
                </Button>
            </div>
        </div>
    );
}
