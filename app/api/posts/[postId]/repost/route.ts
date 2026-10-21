import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
    const { postId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check if already reposted
    const { data: existing } = await supabase
        .from("reposts")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

    if (existing) {
        // Undo repost
        await supabase.from("reposts").delete().eq("id", existing.id);
        await supabase.from("posts").update({ reposts_count: supabase.rpc("decrement", { id: postId }) }).eq("id", postId);
        return NextResponse.json({ reposted: false });
    }

    // Repost
    await supabase.from("reposts").insert({ post_id: postId, user_id: user.id });
    await supabase.rpc("increment_reposts", { post_id: postId });
    return NextResponse.json({ reposted: true }, { status: 201 });
}
