import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ storyId: string }> }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { storyId } = await params;

    const { data: story } = await supabase
        .from("stories")
        .select("id, expires_at")
        .eq("id", storyId)
        .gt("expires_at", new Date().toISOString())
        .single();

    if (!story) return NextResponse.json({ error: "Story not found or expired" }, { status: 404 });

    await supabase
        .from("story_views")
        .upsert({ story_id: storyId, viewer_id: user.id }, { onConflict: "story_id,viewer_id" });

    await supabase.rpc("increment_story_views", { story_id: storyId });

    return NextResponse.json({ viewed: true });
}
