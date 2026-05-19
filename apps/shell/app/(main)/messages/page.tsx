// Shell route: /messages  →  delegates to messages_mfe/MessagesPage

import dynamic from "next/dynamic";
import { Spinner } from "@feedflow/ui";

const MessagesPage = dynamic(
    () => import("messages_mfe/MessagesPage"),
    {
        loading: () => (
            <div className="flex items-center justify-center h-64">
                <Spinner className="h-8 w-8" />
            </div>
        ),
        ssr: false,
    }
);

export default function MessagesRoute() {
    return <MessagesPage />;
}
