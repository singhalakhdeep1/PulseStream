import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ConversationList } from "@/components/messages/conversation-list";
import { ChatWindow } from "@/components/messages/chat-window";

export default async function ConversationPage({ params }: { params: { conversationId: string } }) {
    const { conversationId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: conversation } = await supabase
        .from("conversations")
        .select(`id, participant_1, participant_2,
      p1:profiles!conversations_participant_1_fkey(username, avatar_url),
      p2:profiles!conversations_participant_2_fkey(username, avatar_url)`)
        .eq("id", conversationId)
        .single();

    if (!conversation) redirect("/messages");

    const isP1 = conversation.participant_1 === user.id;
    const other = isP1 ? (conversation.p2 as any) : (conversation.p1 as any);

    return (
        <div className="flex h-full">
            <div className="w-80 shrink-0 hidden md:block">
                <ConversationList currentUserId={user.id} />
            </div>
            <div className="flex-1">
                <ChatWindow
                    conversationId={conversationId}
                    currentUserId={user.id}
                    otherUsername={other?.username ?? "Unknown"}
                    otherAvatarUrl={other?.avatar_url ?? null}
                />
            </div>
        </div>
    );
}
