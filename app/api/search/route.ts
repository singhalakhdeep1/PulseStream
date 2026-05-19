import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    if (!q) return NextResponse.json({ profiles: [], posts: [] });

    const supabase = await createClient();

    // Parallel: FTS on posts + trigram search on profiles
    const [{ data: profiles }, { data: posts }] = await Promise.all([
        supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url, is_verified, follower_count")
            .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
            .order("follower_count", { ascending: false })
            .limit(8),
        supabase
            .from("posts")
            .select(`
        id, content, created_at, like_count,
        author:profiles!posts_author_id_fkey(id, username, full_name, avatar_url)
      `)
            .textSearch("search_vector", q, { type: "websearch" })
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(10),
    ]);

    return NextResponse.json({ profiles: profiles ?? [], posts: posts ?? [] });
}
