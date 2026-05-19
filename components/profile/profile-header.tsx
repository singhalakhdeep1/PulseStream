"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCount, getInitials } from "@/lib/utils";
import { useToggleFollow } from "@/lib/hooks/use-profile";
import { useState } from "react";
import type { Profile } from "@/types";
import { CheckCircle, Link as LinkIcon, MapPin } from "lucide-react";

interface Props {
    profile: Profile;
    currentUserId: string | null;
    isFollowing: boolean;
}

export function ProfileHeader({ profile, currentUserId, isFollowing }: Props) {
    const [following, setFollowing] = useState(isFollowing);
    const { mutate: toggleFollow, isPending } = useToggleFollow();
    const isOwnProfile = currentUserId === profile.id;

    const handleFollow = () => {
        if (!currentUserId) return;
        const next = !following;
        setFollowing(next);
        toggleFollow({ targetUserId: profile.id, currentUserId, isFollowing: following });
    };

    return (
        <div>
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5" />

            {/* Profile info */}
            <div className="px-4 pb-4">
                <div className="flex items-end justify-between -mt-10 mb-4">
                    <Avatar className="h-20 w-20 ring-4 ring-background">
                        <AvatarImage src={profile.avatar_url ?? undefined} />
                        <AvatarFallback className="text-xl">{getInitials(profile.full_name)}</AvatarFallback>
                    </Avatar>
                    {isOwnProfile ? (
                        <Button variant="outline" size="sm">Edit profile</Button>
                    ) : currentUserId ? (
                        <Button
                            variant={following ? "outline" : "default"}
                            size="sm"
                            onClick={handleFollow}
                            disabled={isPending}
                        >
                            {following ? "Following" : "Follow"}
                        </Button>
                    ) : null}
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                        <h1 className="text-xl font-bold">{profile.full_name}</h1>
                        {profile.is_verified && (
                            <CheckCircle className="h-5 w-5 text-primary fill-primary/20" />
                        )}
                    </div>
                    <p className="text-muted-foreground text-sm">@{profile.username}</p>
                    {profile.bio && <p className="text-sm mt-2">{profile.bio}</p>}

                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-2">
                        {profile.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" /> {profile.location}
                            </span>
                        )}
                        {profile.website && (
                            <a
                                href={profile.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                            >
                                <LinkIcon className="h-3.5 w-3.5" />
                                {profile.website.replace(/^https?:\/\//, "")}
                            </a>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 mt-3 text-sm">
                        <span>
                            <strong>{formatCount(profile.following_count)}</strong>{" "}
                            <span className="text-muted-foreground">Following</span>
                        </span>
                        <span>
                            <strong>{formatCount(profile.follower_count)}</strong>{" "}
                            <span className="text-muted-foreground">Followers</span>
                        </span>
                        <span>
                            <strong>{formatCount(profile.post_count)}</strong>{" "}
                            <span className="text-muted-foreground">Posts</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
