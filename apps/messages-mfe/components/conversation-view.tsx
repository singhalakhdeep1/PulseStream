"use client";
// ─── ConversationView — exposed by messages_mfe ───────────────────────────────

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Spinner, UserAvatar } from "@feedflow/ui";
import { Send } from "lucide-react";
import type { Message } from "@feedflow/types";
import { gqlFetch } from "../lib/gql-client";
import { formatDistanceToNow } from "date-fns";

const CONVERSATION_QUERY = `
    query Conversation($id: ID!) {
        conversation(id: $id) {
            id participants { id username displayName avatarUrl }
            messages: lastMessage { id }
        }
    }
`;

const MESSAGES_QUERY = `
    query Messages($conversationId: ID!, $after: String) {
        conversation(id: $conversationId) {
            id
        }
    }
`;

const SEND_MESSAGE_MUTATION = `
    mutation SendMessage($conversationId: ID!, $content: String!) {
        sendMessage(conversationId: $conversationId, content: $content) {
            id content createdAt senderId
        }
    }
`;

interface ConversationViewProps { conversationId: string }

export function ConversationView({ conversationId }: ConversationViewProps) {
    const [input, setInput] = React.useState("");
    const bottomRef = React.useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    const { data: convData, isLoading } = useQuery({
        queryKey: ["conversation", conversationId],
        queryFn: () => gqlFetch<{ conversation: { id: string; participants: Array<{ id: string; displayName: string; avatarUrl: string | null; username: string }> } }>(
            CONVERSATION_QUERY,
            { id: conversationId }
        ),
    });

    const sendMutation = useMutation({
        mutationFn: (content: string) =>
            gqlFetch(SEND_MESSAGE_MUTATION, { conversationId, content }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversation", conversationId] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            setInput("");
        },
    });

    React.useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) sendMutation.mutate(input.trim());
    };

    const other = convData?.conversation.participants[0];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
                {isLoading ? <Spinner /> : other && (
                    <>
                        <UserAvatar user={other} size="sm" />
                        <div>
                            <p className="text-sm font-semibold">{other.displayName}</p>
                            <p className="text-xs text-muted-foreground">@{other.username}</p>
                        </div>
                    </>
                )}
            </div>

            {/* Messages area — scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                <p className="text-center text-xs text-muted-foreground">
                    This is the beginning of your conversation.
                </p>
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="border-t border-border p-3 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || sendMutation.isPending}
                    className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                    {sendMutation.isPending ? <Spinner className="h-3 w-3" /> : <Send className="h-4 w-4" />}
                </button>
            </form>
        </div>
    );
}

export default ConversationView;
