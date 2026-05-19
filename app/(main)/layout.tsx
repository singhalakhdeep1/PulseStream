import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavSidebar } from "@/components/shared/nav-sidebar";
import { RightSidebar } from "@/components/shared/right-sidebar";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return (
        <div className="min-h-screen flex max-w-7xl mx-auto">
            {/* Left sidebar — navigation */}
            <aside className="sticky top-0 h-screen w-64 shrink-0 hidden md:flex flex-col border-r border-border p-4">
                <NavSidebar user={profile} />
            </aside>

            {/* Center — main content */}
            <main className="flex-1 min-h-screen border-r border-border">
                {children}
            </main>

            {/* Right sidebar — trending, suggestions */}
            <aside className="sticky top-0 h-screen w-80 shrink-0 hidden lg:flex flex-col p-4">
                <RightSidebar />
            </aside>
        </div>
    );
}
