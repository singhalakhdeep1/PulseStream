import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Hash } from "lucide-react";

export async function RightSidebar() {
    const supabase = await createClient();
    const { data: trending } = await supabase
        .from("trending_hashtags")
        .select("*")
        .limit(8);

    const { data: suggestions } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url, avatar_blurhash, is_verified")
        .order("follower_count", { ascending: false })
        .limit(5);

    return (
        <div className="flex flex-col gap-6 pt-2">
            {/* Trending */}
            {trending && trending.length > 0 && (
                <div>
                    <h2 className="font-bold text-base mb-3">Trending</h2>
                    <div className="space-y-3">
                        {trending.map((tag: any) => (
                            <Link
                                key={tag.id}
                                href={`/explore?q=%23${tag.tag}`}
                                className="flex items-center gap-2 group"
                            >
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium group-hover:text-primary transition-colors">
                                        #{tag.tag}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{tag.posts_24h ?? 0} posts today</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Suggestions */}
            {suggestions && suggestions.length > 0 && (
                <div>
                    <h2 className="font-bold text-base mb-3">Who to follow</h2>
                    <div className="space-y-3">
                        {suggestions.map((profile: any) => (
                            <Link
                                key={profile.id}
                                href={`/${profile.username}`}
                                className="flex items-center gap-2 group"
                            >
                                <div className="h-9 w-9 rounded-full bg-muted shrink-0 flex items-center justify-center text-xs font-medium">
                                    {profile.full_name?.[0] ?? "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                        {profile.full_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">@{profile.username}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
