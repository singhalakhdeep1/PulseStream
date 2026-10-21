"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMessages, useSendMessage } from "@/lib/hooks/use-messages";
import { getInitials, formatRelativeTime } from "@/lib/utils";
import { Send } from "lucide-react";

interface Props {
    conversationId: string;
    currentUserId: string;
    otherUsername: string;
    otherAvatarUrl: string | null;
}

export function ChatWindow({ conversationId, currentUserId, otherUsername, otherAvatarUrl }: Props) {
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);
    const { data: messages = [], isLoading } = useMessages(conversationId);
    const sendMessage = useSendMessage();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function handleSend() {
        const content = input.trim();
        if (!content) return;
        setInput("");
        await sendMessage.mutateAsync({ conversationId, content });
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Avatar className="w-9 h-9">
                    <AvatarImage src={otherAvatarUrl ?? undefined} />
                    <AvatarFallback>{getInitials(otherUsername)}</AvatarFallback>
                </Avatar>
                <span className="font-semibold">@{otherUsername}</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoading && <p className="text-center text-muted-foreground text-sm">Loading…</p>}
                {messages.map((msg) => {
                    const isMe = msg.sender_id === currentUserId;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                                {msg.content}
                                <div className={`text-xs mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                    {formatRelativeTime(msg.created_at)}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 px-4 py-3 border-t border-border">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Send a message…"
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    className="flex-1"
                />
                <Button size="icon" onClick={handleSend} disabled={!input.trim() || sendMessage.isPending}>
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
