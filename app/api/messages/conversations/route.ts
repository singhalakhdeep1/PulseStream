import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
        .from("conversations")
        .select(`
            id, updated_at,
            participants:conversation_participants(
                user:profiles(id, username, display_name, avatar_url)
            ),
            last_message:messages(id, content, created_at, sender_id)
        `)
        .eq("conversation_participants.user_id", user.id)
        .order("updated_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { participantId, content } = await req.json();
    if (!participantId || !content?.trim()) {
        return NextResponse.json({ error: "participantId and content required" }, { status: 400 });
    }

    const { data: conv, error: convErr } = await supabase
        .from("conversations")
        .insert({ created_by: user.id })
        .select("id")
        .single();

    if (convErr) return NextResponse.json({ error: convErr.message }, { status: 500 });

    await supabase.from("conversation_participants").insert([
        { conversation_id: conv.id, user_id: user.id },
        { conversation_id: conv.id, user_id: participantId },
    ]);

    const { data: msg, error: msgErr } = await supabase
        .from("messages")
        .insert({ conversation_id: conv.id, sender_id: user.id, content })
        .select()
        .single();

    if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });
    return NextResponse.json({ conversationId: conv.id, message: msg }, { status: 201 });
}
