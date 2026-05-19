"use client";
// ─── @feedflow/auth/client ───────────────────────────────────────────────────
// Browser-safe Supabase client + auth hooks.
// All MFEs import from here — ensures only ONE Supabase instance is shared
// via the shell's auth context (Module Federation shares this module).

import { createBrowserClient as _createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { AuthUser } from "@feedflow/types";

export function createBrowserClient() {
    return _createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// Singleton — Module Federation shares this across MFEs
let _client: ReturnType<typeof createBrowserClient> | null = null;
export function getSharedClient() {
    if (!_client) _client = createBrowserClient();
    return _client;
}

/** Get the authenticated user from the browser client */
export async function getUser(): Promise<AuthUser | null> {
    const supabase = getSharedClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return profile ?? null;
}

/** React hook — subscribes to auth state changes */
export function useCurrentUser(): { user: AuthUser | null; loading: boolean } {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = getSharedClient();

        getUser().then((u) => {
            setUser(u);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === "SIGNED_OUT") {
                setUser(null);
            } else {
                const u = await getUser();
                setUser(u);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return { user, loading };
}

/** Sign out — shared across all MFEs */
export async function signOut(): Promise<void> {
    const supabase = getSharedClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
}
