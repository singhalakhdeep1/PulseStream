import { createClient } from "@/lib/supabase/server";
import { FeedList } from "@/components/feed/feed-list";
import { StoriesBar } from "@/components/stories/stories-bar";
import { CreatePostDialog } from "@/components/feed/create-post-dialog";
import { FeedErrorBoundary } from "@/components/shared/error-boundaries";

export default async function FeedPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, avatar_blurhash")
        .eq("id", user!.id)
        .single();

    return (
        <div className="flex flex-col divide-y divide-border">
            {/* Stories */}
            <StoriesBar userId={user!.id} />

            {/* Compose */}
            <div className="p-4">
                <CreatePostDialog profile={profile} />
            </div>

            {/* Feed */}
            <FeedErrorBoundary>
                <FeedList userId={user!.id} />
            </FeedErrorBoundary>
        </div>
    );
}
