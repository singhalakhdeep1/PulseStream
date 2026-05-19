// Shell route: /feed  →  delegates to feed_mfe/FeedPage
// The actual rendering logic lives in apps/feed-mfe.
// Module Federation loads it at runtime — no build-time coupling.

import dynamic from "next/dynamic";
import { Spinner } from "@feedflow/ui";

const FeedPage = dynamic(
    () => import("feed_mfe/FeedPage"),
    {
        loading: () => (
            <div className="flex items-center justify-center h-64">
                <Spinner className="h-8 w-8" />
            </div>
        ),
        ssr: false, // MFE pages hydrate client-side
    }
);

export default function FeedRoute() {
    return <FeedPage />;
}
