import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ExploreClient } from "@/components/explore/explore-client";

export const metadata: Metadata = { title: "Explore" };

export default async function ExplorePage() {
    const supabase = await createClient();

    const { data: trending } = await supabase
        .from("trending_hashtags")
        .select("*")
        .limit(10);

    return <ExploreClient trendingHashtags={trending ?? []} />;
}
