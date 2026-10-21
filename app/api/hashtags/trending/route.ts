import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from("post_hashtags")
        .select("hashtag")
        .gte("created_at", since)
        .limit(1000);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
        counts[row.hashtag] = (counts[row.hashtag] ?? 0) + 1;
    }

    const trending = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([hashtag, count]) => ({ hashtag, count }));

    return NextResponse.json(trending);
}
