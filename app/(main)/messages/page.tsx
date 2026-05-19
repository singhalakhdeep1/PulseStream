import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function MessagesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: conversations } = await supabase
        .from("conversations")
        .select(`id, participant_1, participant_2, last_message, last_message_at`)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order("last_message_at", { ascending: false })
        .limit(1);

    if (conversations && conversations.length > 0) {
        redirect(`/messages/${conversations[0].id}`);
    }

    return (
        <div className="flex items-center justify-center h-full text-center p-8">
            <div>
                <div className="text-5xl mb-4">💬</div>
                <h2 className="text-xl font-semibold mb-2">Your messages</h2>
                <p className="text-muted-foreground">Send private messages to other users.</p>
            </div>
        </div>
    );
}
