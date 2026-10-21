import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadImage } from "@/lib/cloudflare/images";
import { MAX_MEDIA_PER_POST, SUPPORTED_IMAGE_TYPES } from "@/lib/constants";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) return NextResponse.json({ error: "No files provided" }, { status: 400 });
    if (files.length > MAX_MEDIA_PER_POST) return NextResponse.json({ error: `Max ${MAX_MEDIA_PER_POST} files` }, { status: 400 });

    const results: Array<{ url: string; id: string }> = [];

    for (const file of files) {
        if (!SUPPORTED_IMAGE_TYPES.includes(file.type as typeof SUPPORTED_IMAGE_TYPES[number])) {
            return NextResponse.json({ error: `Unsupported type: ${file.type}` }, { status: 400 });
        }
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
        }

        const result = await uploadImage(file, { userId: user.id });
        results.push({ url: result.url, id: result.id });
    }

    return NextResponse.json({ files: results });
}
