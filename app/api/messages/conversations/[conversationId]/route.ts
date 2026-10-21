import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { conversationId } = await params;

    const { count } = await supabase
        .from("conversation_participants")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id);

    if (!count) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);
    const before = url.searchParams.get("before");

    let query = supabase
        .from("messages")
        .select("*, sender:profiles(id, username, avatar_url)")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (before) query = query.lt("created_at", before);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { conversationId } = await params;
    const { content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: "content required" }, { status: 400 });

    const { count } = await supabase
        .from("conversation_participants")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", conversationId)
        .eq("user_id", user.id);

    if (!count) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data, error } = await supabase
        .from("messages")
        .insert({ conversation_id: conversationId, sender_id: user.id, content })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

    return NextResponse.json(data, { status: 201 });
}
