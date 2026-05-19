"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useRealtimeFeed(userId: string | null) {
    const supabase = createClient();
    const qc = useQueryClient();

    useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel(`feed:${userId}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "posts" },
                () => {
                    qc.invalidateQueries({ queryKey: ["feed"] });
                }
            )
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "likes" },
                () => {
                    qc.invalidateQueries({ queryKey: ["feed"] });
                }
            )
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
                () => {
                    qc.invalidateQueries({ queryKey: ["notifications", userId] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);
}
