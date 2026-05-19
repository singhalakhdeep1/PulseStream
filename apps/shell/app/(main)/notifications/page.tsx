// Shell route: /notifications  →  delegates to notifications_mfe/NotificationsPage

import dynamic from "next/dynamic";
import { Spinner } from "@feedflow/ui";

const NotificationsPage = dynamic(
    () => import("notifications_mfe/NotificationsPage"),
    {
        loading: () => (
            <div className="flex items-center justify-center h-64">
                <Spinner className="h-8 w-8" />
            </div>
        ),
        ssr: false,
    }
);

export default function NotificationsRoute() {
    return <NotificationsPage />;
}
