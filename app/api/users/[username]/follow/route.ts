import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get target user profile
    const { data: target } = await supabase.from("profiles").select("id").eq("username", username).single();
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (target.id === user.id) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

    // Check if already following
    const { data: existing } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", target.id)
        .single();

    if (existing) {
        // Unfollow
        await supabase.from("follows").delete().eq("id", existing.id);
        return NextResponse.json({ following: false });
    }

    // Follow
    await supabase.from("follows").insert({ follower_id: user.id, following_id: target.id });

    // Create notification
    await supabase.from("notifications").insert({
        user_id: target.id,
        type: "follow",
        actor_id: user.id,
    });

    return NextResponse.json({ following: true }, { status: 201 });
}
