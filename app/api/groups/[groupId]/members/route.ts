import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ groupId: string }> }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { groupId } = await params;

    const { data, error } = await supabase
        .from("group_members")
        .select("role, joined_at, user:profiles(id, username, display_name, avatar_url)")
        .eq("group_id", groupId);

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
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const { data: admin } = await supabase
        .from("group_members")
        .select("role")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .single();

    if (!admin || admin.role !== "admin") {
        return NextResponse.json({ error: "Only admins can add members" }, { status: 403 });
    }

    const { data, error } = await supabase
        .from("group_members")
        .insert({ group_id: groupId, user_id: userId, role: "member" })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
}
