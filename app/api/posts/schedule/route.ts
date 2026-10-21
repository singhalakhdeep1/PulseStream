import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const content: string = body.content?.trim() ?? "";
    const scheduledAt: string = body.scheduledAt;
    const mediaUrls: string[] = body.mediaUrls ?? [];

    if (!content) return NextResponse.json({ error: "content required" }, { status: 400 });
    if (!scheduledAt) return NextResponse.json({ error: "scheduledAt required" }, { status: 400 });

    const scheduled = new Date(scheduledAt);
    if (isNaN(scheduled.getTime()) || scheduled <= new Date()) {
        return NextResponse.json({ error: "scheduledAt must be a future date" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("posts")
        .insert({
            author_id: user.id,
            content,
            status: "scheduled",
            scheduled_at: scheduled.toISOString(),
        })
        .select("id")
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (mediaUrls.length > 0) {
        const mediaRows = mediaUrls.map((url, i) => ({
            post_id: data.id,
            media_type: "image",
            url,
            sort_order: i,
        }));
        await supabase.from("post_media").insert(mediaRows);
    }

    return NextResponse.json({ postId: data.id, scheduledAt: scheduled.toISOString() }, { status: 201 });
}
