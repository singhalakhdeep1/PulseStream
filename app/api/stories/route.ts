import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: followingData } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

    const followingIds = (followingData ?? []).map((f: { following_id: string }) => f.following_id);

    const { data, error } = await supabase
        .from("stories")
        .select("*, author:profiles(id, username, avatar_url)")
        .in("author_id", followingIds)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { media_url, media_type, caption } = body;
    if (!media_url || !media_type) return NextResponse.json({ error: "media_url and media_type required" }, { status: 400 });

    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from("stories")
        .insert({ author_id: user.id, media_url, media_type, caption: caption ?? null, expires_at })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
}
