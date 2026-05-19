import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfilePostsGrid } from "@/components/profile/profile-posts-grid";

interface Props { params: Promise<{ username: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params;
    return { title: `@${username}` };
}

export default async function ProfilePage({ params }: Props) {
    const { username } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

    if (!profile) notFound();

    let isFollowing = false;
    if (user && user.id !== profile.id) {
        const { data: follow } = await supabase
            .from("follows")
            .select("follower_id")
            .eq("follower_id", user.id)
            .eq("following_id", profile.id)
            .single();
        isFollowing = !!follow;
    }

    return (
        <div>
            <ProfileHeader profile={profile} currentUserId={user?.id ?? null} isFollowing={isFollowing} />
            <ProfilePostsGrid userId={profile.id} />
        </div>
    );
}
