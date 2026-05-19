"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/types";

export function useNotifications(userId: string | null) {
    const supabase = createClient();
    return useQuery({
        queryKey: ["notifications", userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("notifications")
                .select(`
          *,
          actor:profiles!notifications_actor_id_fkey(id, username, full_name, avatar_url, avatar_blurhash)
        `)
                .eq("user_id", userId!)
                .order("created_at", { ascending: false })
                .limit(50);
            if (error) throw error;
            return (data ?? []) as Notification[];
        },
        enabled: !!userId,
        refetchInterval: 30_000,
    });
}

export function useMarkNotificationRead() {
    const supabase = createClient();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
            await supabase.from("notifications").update({ is_read: true }).eq("id", id);
        },
        onSuccess: (_data, { userId }) => {
            qc.invalidateQueries({ queryKey: ["notifications", userId] });
        },
    });
}

export function useMarkAllNotificationsRead() {
    const supabase = createClient();
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId);
        },
        onSuccess: (_data, userId) => {
            qc.invalidateQueries({ queryKey: ["notifications", userId] });
        },
    });
}
