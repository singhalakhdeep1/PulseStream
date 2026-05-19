import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireServerAuth } from "@feedflow/auth/server";
import { NavSidebar } from "../components/nav-sidebar";
import { RightSidebar } from "../components/right-sidebar";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies();
    const { user } = await requireServerAuth(cookieStore);

    return (
        <div className="min-h-screen flex max-w-7xl mx-auto">
            {/* Left sidebar — static shell navigation, always owned by shell app */}
            <aside className="sticky top-0 h-screen w-64 shrink-0 hidden md:flex flex-col border-r border-border p-4">
                <NavSidebar user={user} />
            </aside>

            {/* Center — MFE content injected here */}
            <main className="flex-1 min-h-screen border-r border-border">
                {children}
            </main>

            {/* Right sidebar — shell-owned trending/suggestions widget */}
            <aside className="sticky top-0 h-screen w-80 shrink-0 hidden lg:flex flex-col p-4">
                <RightSidebar />
            </aside>
        </div>
    );
}
