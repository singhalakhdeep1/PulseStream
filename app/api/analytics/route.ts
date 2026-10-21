import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const range = url.searchParams.get("range") ?? "7d";
    const days = range === "30d" ? 30 : range === "90d" ? 90 : 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const [postsRes, likesRes, followersRes, profileRes] = await Promise.all([
        supabase
            .from("posts")
            .select("id, created_at, likes_count, comments_count, reposts_count", { count: "exact" })
            .eq("author_id", user.id)
            .eq("status", "active")
            .gte("created_at", since),
        supabase
            .from("post_likes")
            .select("created_at", { count: "exact" })
            .in(
                "post_id",
                (
                    await supabase
                        .from("posts")
                        .select("id")
                        .eq("author_id", user.id)
                ).data?.map((p) => p.id) ?? []
            )
            .gte("created_at", since),
        supabase
            .from("follows")
            .select("created_at", { count: "exact" })
            .eq("following_id", user.id)
            .gte("created_at", since),
        supabase
            .from("profiles")
            .select("followers_count, following_count, posts_count")
            .eq("id", user.id)
            .single(),
    ]);

    const posts = postsRes.data ?? [];
    const totalImpressions = posts.reduce(
        (sum, p) => sum + (p.likes_count ?? 0) + (p.comments_count ?? 0) + (p.reposts_count ?? 0),
        0
    );

    return NextResponse.json({
        postsCount: postsRes.count ?? 0,
        likesReceived: likesRes.count ?? 0,
        newFollowers: followersRes.count ?? 0,
        impressions: totalImpressions,
        profile: profileRes.data ?? null,
        range,
    });
}
