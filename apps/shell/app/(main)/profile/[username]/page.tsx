// Shell route: /profile/[username]  →  delegates to profile_mfe/ProfilePage

import dynamic from "next/dynamic";
import { Spinner } from "@feedflow/ui";

const ProfilePage = dynamic(
    () => import("profile_mfe/ProfilePage"),
    {
        loading: () => (
            <div className="flex items-center justify-center h-64">
                <Spinner className="h-8 w-8" />
            </div>
        ),
        ssr: false,
    }
);

interface Props { params: Promise<{ username: string }> }

export default async function ProfileRoute({ params }: Props) {
    const { username } = await params;
    return <ProfilePage username={username} />;
}
