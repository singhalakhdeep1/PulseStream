"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Story } from "@/types";

export function useStories(userId: string | null) {
    const supabase = createClient();
    return useQuery({
        queryKey: ["stories", userId],
        queryFn: async () => {
            // Fetch stories from people the current user follows
            const { data, error } = await supabase
                .from("stories")
                .select(`
          *,
          author:profiles!stories_author_id_fkey(id, username, full_name, avatar_url, avatar_blurhash, is_verified)
        `)
                .gt("expires_at", new Date().toISOString())
                .order("created_at", { ascending: false })
                .limit(30);
            if (error) throw error;
            return (data ?? []) as Story[];
        },
        enabled: !!userId,
        staleTime: 1000 * 60,
    });
}
