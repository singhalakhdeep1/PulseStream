// ─── @feedflow/auth/server ───────────────────────────────────────────────────
// Server-side Supabase client for Next.js App Router (RSC + route handlers).
// Used in each MFE's server components and API routes.

import { createServerClient as _createServerClient } from "@supabase/ssr";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import type { AuthUser } from "@feedflow/types";

export function createServerClient(cookieStore: ReadonlyRequestCookies) {
    return _createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            (cookieStore as any).set(name, value, options)
                        );
                    } catch {
                        // Called from a Server Component — can be ignored if middleware refreshes sessions
                    }
                },
            },
        }
    );
}

/**
 * Require auth in a server component or route handler.
 * Redirects to /login if no session.
 */
export async function requireServerAuth(
    cookieStore: ReadonlyRequestCookies
): Promise<{ user: AuthUser; supabase: ReturnType<typeof createServerClient> }> {
    const { redirect } = await import("next/navigation");
    const supabase = createServerClient(cookieStore);

    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    if (error || !authUser) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

    if (!profile) redirect("/login");

    return { user: profile as AuthUser, supabase };
}
