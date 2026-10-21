import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ groupId: string }> }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { groupId } = await params;

    const { count } = await supabase
        .from("group_members")
        .select("id", { count: "exact", head: true })
        .eq("group_id", groupId)
        .eq("user_id", user.id);

    if (!count) return NextResponse.json({ error: "Not a member" }, { status: 403 });

    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 100);
    const before = url.searchParams.get("before");

    let query = supabase
        .from("group_messages")
        .select("*, sender:profiles(id, username, avatar_url)")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (before) query = query.lt("created_at", before);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ groupId: string }> }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { groupId } = await params;
    const { content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: "content required" }, { status: 400 });

    const { count } = await supabase
        .from("group_members")
        .select("id", { count: "exact", head: true })
        .eq("group_id", groupId)
        .eq("user_id", user.id);

    if (!count) return NextResponse.json({ error: "Not a member" }, { status: 403 });

    const { data, error } = await supabase
        .from("group_messages")
        .insert({ group_id: groupId, sender_id: user.id, content })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
}
