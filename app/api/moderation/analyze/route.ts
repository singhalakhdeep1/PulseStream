import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

function getOpenAI() {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: "content required" }, { status: 400 });

    try {
        const result = await getOpenAI().moderations.create({ input: content });
        const check = result.results[0];
        return NextResponse.json({
            flagged: check.flagged,
            categories: check.categories,
            scores: check.category_scores,
        });
    } catch {
        return NextResponse.json({ flagged: false, categories: {}, scores: {} });
    }
}
