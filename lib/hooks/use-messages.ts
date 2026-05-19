"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface Conversation {
    id: string;
    other_user_id: string;
    other_username: string;
    other_avatar_url: string | null;
    last_message: string | null;
    last_message_at: string | null;
    unread_count: number;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

export function useConversations(userId: string) {
    const supabase = createClient();
    return useQuery({
        queryKey: ["conversations", userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("conversations")
                .select(`id, participant_1, participant_2, last_message, last_message_at,
          p1:profiles!conversations_participant_1_fkey(username, avatar_url),
          p2:profiles!conversations_participant_2_fkey(username, avatar_url)`)
                .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
                .order("last_message_at", { ascending: false });

            if (error) throw error;
            return (data ?? []).map((c: any) => {
                const isP1 = c.participant_1 === userId;
                const other = isP1 ? c.p2 : c.p1;
                return {
                    id: c.id,
                    other_user_id: isP1 ? c.participant_2 : c.participant_1,
                    other_username: other?.username ?? "Unknown",
                    other_avatar_url: other?.avatar_url ?? null,
                    last_message: c.last_message,
                    last_message_at: c.last_message_at,
                    unread_count: 0,
                } as Conversation;
            });
        },
        enabled: !!userId,
    });
}

export function useMessages(conversationId: string) {
    const supabase = createClient();
    return useQuery({
        queryKey: ["messages", conversationId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .eq("conversation_id", conversationId)
                .order("created_at", { ascending: true });
            if (error) throw error;
            return data as Message[];
        },
        enabled: !!conversationId,
        refetchInterval: 3000,
    });
}

export function useSendMessage() {
    const supabase = createClient();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");
            const { data, error } = await supabase
                .from("messages")
                .insert({ conversation_id: conversationId, sender_id: user.id, content })
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ["messages", vars.conversationId] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        },
    });
}
