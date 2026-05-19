"use client";
// ─── ProfilePage — exposed by profile_mfe ─────────────────────────────────────

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserAvatar, Button, Spinner, EmptyState, PostCard } from "@feedflow/ui";
import { User, MapPin, LinkIcon, CalendarDays } from "lucide-react";
import type { Post } from "@feedflow/types";
import { gqlFetch } from "../lib/gql-client";
import { format } from "date-fns";
import { EditProfileModal } from "./edit-profile-modal";

const PROFILE_QUERY = `
    query Profile($username: String!) {
        user(username: $username) {
            id username displayName bio avatarUrl coverUrl
            followersCount followingCount postsCount isVerified
            isFollowing createdAt location website
            posts(first: 20) { id content imageUrls likesCount commentsCount createdAt isLiked isBookmarked }
        }
    }
`;

const FOLLOW_MUTATION = `
    mutation Follow($userId: ID!) { followUser(userId: $userId) { id isFollowing followersCount } }
`;
const UNFOLLOW_MUTATION = `
    mutation Unfollow($userId: ID!) { unfollowUser(userId: $userId) { id isFollowing followersCount } }
`;

interface ProfilePageProps { username: string }

export default function ProfilePage({ username }: ProfilePageProps) {
    const [editOpen, setEditOpen] = React.useState(false);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["profile", username],
        queryFn: () => gqlFetch<{ user: any }>(PROFILE_QUERY, { username }),
    });

    const followMutation = useMutation({
        mutationFn: (userId: string) => gqlFetch(FOLLOW_MUTATION, { userId }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", username] }),
    });
    const unfollowMutation = useMutation({
        mutationFn: (userId: string) => gqlFetch(UNFOLLOW_MUTATION, { userId }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", username] }),
    });

    if (isLoading) {
        return <div className="flex items-center justify-center py-24"><Spinner className="h-8 w-8" /></div>;
    }

    const user = data?.user;
    if (!user) {
        return <EmptyState icon={User} title="User not found" description={`@${username} doesn't exist.`} />;
    }

    const posts: Post[] = user.posts ?? [];

    return (
        <div>
            {/* Cover image */}
            <div
                className="h-48 bg-gradient-to-br from-primary/30 to-secondary/30"
                style={user.coverUrl ? { backgroundImage: `url(${user.coverUrl})`, backgroundSize: "cover" } : undefined}
            />

            {/* Avatar + actions row */}
            <div className="px-4 pb-4 border-b border-border">
                <div className="flex items-end justify-between -mt-12 mb-3">
                    <UserAvatar user={user} size="lg" className="ring-4 ring-background" />
                    <div className="flex gap-2 mt-12">
                        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>Edit profile</Button>
                        {user.isFollowing ? (
                            <Button variant="outline" size="sm" onClick={() => unfollowMutation.mutate(user.id)}>
                                {unfollowMutation.isPending ? <Spinner className="h-3 w-3" /> : "Unfollow"}
                            </Button>
                        ) : (
                            <Button size="sm" onClick={() => followMutation.mutate(user.id)}>
                                {followMutation.isPending ? <Spinner className="h-3 w-3" /> : "Follow"}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <h1 className="text-xl font-bold">{user.displayName}</h1>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                    {user.bio && <p className="text-sm mt-2">{user.bio}</p>}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                        {user.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{user.location}</span>}
                        {user.website && (
                            <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                                <LinkIcon className="h-3 w-3" />{user.website.replace(/^https?:\/\//, "")}
                            </a>
                        )}
                        {user.createdAt && (
                            <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />Joined {format(new Date(user.createdAt), "MMMM yyyy")}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-4 text-sm mt-3">
                        <span><strong>{user.followingCount}</strong> <span className="text-muted-foreground">Following</span></span>
                        <span><strong>{user.followersCount}</strong> <span className="text-muted-foreground">Followers</span></span>
                    </div>
                </div>
            </div>

            {/* Posts */}
            <div className="divide-y divide-border">
                {posts.length === 0 ? (
                    <EmptyState icon={User} title="No posts yet" description={`${user.displayName} hasn't posted yet.`} />
                ) : (
                    posts.map((post) => <PostCard key={post.id} post={post} />)
                )}
            </div>

            <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} user={user} />
        </div>
    );
}
