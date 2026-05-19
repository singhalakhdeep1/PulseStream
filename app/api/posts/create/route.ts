import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const content: string = body.content?.trim() ?? "";
    const mediaUrls: string[] = body.mediaUrls ?? [];

    if (!content) return NextResponse.json({ error: "Content is required" }, { status: 400 });
    if (content.length > 2000) return NextResponse.json({ error: "Post too long" }, { status: 400 });

    // AI content moderation
    try {
        const modRes = await openai.moderations.create({ input: content });
        const result = modRes.results[0];
        if (result.flagged) {
            return NextResponse.json(
                { error: "Your post was flagged by our content policy. Please revise it." },
                { status: 422 }
            );
        }
    } catch {
        // Moderation failed — allow the post but log it
        console.warn("[FeedFlow] AI moderation unavailable, allowing post");
    }

    // Create post
    const { data: post, error: postError } = await supabase
        .from("posts")
        .insert({
            author_id: user.id,
            content,
            ai_moderated: true,
            status: "active",
        })
        .select("id")
        .single();

    if (postError) return NextResponse.json({ error: postError.message }, { status: 500 });

    // Attach media if provided
    if (mediaUrls.length > 0) {
        const mediaRows = mediaUrls.map((url, i) => ({
            post_id: post.id,
            media_type: "image",
            url,
            sort_order: i,
        }));
        await supabase.from("post_media").insert(mediaRows);
    }

    return NextResponse.json({ postId: post.id }, { status: 201 });
}
