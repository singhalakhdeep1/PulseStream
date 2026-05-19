import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BookmarksList } from "@/components/bookmarks/bookmarks-list";

export const metadata: Metadata = { title: "Bookmarks" };

export default async function BookmarksPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return <BookmarksList userId={user!.id} />;
}
