"use client";
// ─── MessagesPage — exposed by messages_mfe ──────────────────────────────────

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Spinner, UserAvatar, EmptyState } from "@feedflow/ui";
import { MessageCircle } from "lucide-react";
import type { Conversation } from "@feedflow/types";
import { gqlFetch } from "../lib/gql-client";
import { ConversationView } from "./conversation-view";

const CONVERSATIONS_QUERY = `
    query Conversations {
        conversations {
            id unreadCount updatedAt
            participants { id username displayName avatarUrl }
            lastMessage { id content createdAt senderId }
        }
    }
`;

export default function MessagesPage() {
    const [activeConversationId, setActiveConversationId] = React.useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["conversations"],
        queryFn: () => gqlFetch<{ conversations: Conversation[] }>(CONVERSATIONS_QUERY),
    });

    const conversations = data?.conversations ?? [];

    return (
        <div className="flex h-full">
            {/* Conversation list */}
            <div className="w-80 shrink-0 border-r border-border flex flex-col">
                <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3">
                    <h1 className="text-lg font-bold">Messages</h1>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <Spinner />
                    </div>
                )}

                {!isLoading && conversations.length === 0 && (
                    <EmptyState icon={MessageCircle} title="No conversations" description="Start a conversation with someone." />
                )}

                <ul className="flex-1 overflow-y-auto">
                    {conversations.map((conv) => {
                        const other = conv.participants[0];
                        const isActive = activeConversationId === conv.id;
                        return (
                            <li key={conv.id}>
                                <button
                                    onClick={() => setActiveConversationId(conv.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors ${isActive ? "bg-muted" : ""}`}
                                >
                                    {other && <UserAvatar user={other} size="md" />}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium truncate">{other?.displayName}</span>
                                            {conv.unreadCount > 0 && (
                                                <span className="ml-2 shrink-0 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        {conv.lastMessage && (
                                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                {conv.lastMessage.content}
                                            </p>
                                        )}
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Conversation view */}
            <div className="flex-1">
                {activeConversationId ? (
                    <ConversationView conversationId={activeConversationId} />
                ) : (
                    <EmptyState
                        icon={MessageCircle}
                        title="Select a conversation"
                        description="Choose a conversation from the list to start messaging."
                        className="h-full"
                    />
                )}
            </div>
        </div>
    );
}
