import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ postId: string }> }
) {
    const { postId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check if already liked
    const { data: existing } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

    if (existing) {
        // Unlike
        await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user.id);
        return NextResponse.json({ liked: false });
    } else {
        // Like
        await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
        return NextResponse.json({ liked: true });
    }
}
