"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";

export function useProfile(username: string | null) {
    const supabase = createClient();
    return useQuery({
        queryKey: ["profile", username],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("username", username!)
                .single();
            if (error) throw error;
            return data as Profile;
        },
        enabled: !!username,
        staleTime: 1000 * 60 * 5,
    });
}

export function useFollowStatus(targetUserId: string | null, currentUserId: string | null) {
    const supabase = createClient();
    return useQuery({
        queryKey: ["follow-status", targetUserId, currentUserId],
        queryFn: async () => {
            const { data } = await supabase
                .from("follows")
                .select("follower_id")
                .eq("follower_id", currentUserId!)
                .eq("following_id", targetUserId!)
                .single();
            return !!data;
        },
        enabled: !!targetUserId && !!currentUserId && targetUserId !== currentUserId,
    });
}

export function useToggleFollow() {
    const supabase = createClient();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({
            targetUserId,
            currentUserId,
            isFollowing,
        }: { targetUserId: string; currentUserId: string; isFollowing: boolean }) => {
            if (isFollowing) {
                await supabase.from("follows").delete()
                    .eq("follower_id", currentUserId)
                    .eq("following_id", targetUserId);
            } else {
                await supabase.from("follows").insert({
                    follower_id: currentUserId,
                    following_id: targetUserId,
                });
            }
        },
        onSuccess: (_data, { targetUserId, currentUserId }) => {
            qc.invalidateQueries({ queryKey: ["follow-status", targetUserId, currentUserId] });
            qc.invalidateQueries({ queryKey: ["profile"] });
            qc.invalidateQueries({ queryKey: ["feed"] });
        },
    });
}
