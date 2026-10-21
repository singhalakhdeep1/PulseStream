// ─── GraphQL Context ──────────────────────────────────────────────────────────
// Every GraphQL request gets this context object.
// It contains:
//   - auth: the authenticated user (null for unauthenticated queries)
//   - supabase: the Supabase client (with row-level security applied to the user)
//   - loaders: DataLoaders that batch and cache DB reads within a single request
//
// DataLoaders are REQUEST-SCOPED — a new set is created for each request.
// This is critical: you must NOT share loaders across requests.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createUserLoader, createPostLoader, createCommentLoader } from "./dataloaders";
import type { NextRequest } from "next/server";

export interface GraphQLUser {
    id:       string;
    email:    string;
    username: string;
}

export interface GraphQLContext {
    user:     GraphQLUser | null;
    supabase: SupabaseClient;
    loaders: {
        user: ReturnType<typeof createUserLoader>;
        post: ReturnType<typeof createPostLoader>;
        comment: ReturnType<typeof createCommentLoader>;
    };
    req: NextRequest;
}

export async function createContext(req: NextRequest): Promise<GraphQLContext> {
    // Create a server-side Supabase client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: false,  // Server-side: no cookie persistence
            },
            global: {
                headers: {
                    // Forward the auth token from the request header
                    Authorization: req.headers.get("Authorization") ?? "",
                    Cookie: req.headers.get("Cookie") ?? "",
                },
            },
        }
    );

    // Get the authenticated user from the session token
    const { data: { user } } = await supabase.auth.getUser();

    let graphqlUser: GraphQLUser | null = null;
    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("id, username")
            .eq("id", user.id)
            .single();

        if (profile) {
            graphqlUser = {
                id:       user.id,
                email:    user.email!,
                username: profile.username,
            };
        }
    }

    return {
        user:     graphqlUser,
        supabase,
        loaders: {
            user:    createUserLoader(supabase),
            post:    createPostLoader(supabase),
            comment: createCommentLoader(supabase),
        },
        req,
    };
}

/** Throw if the request is not authenticated */
export function requireAuth(ctx: GraphQLContext): GraphQLUser {
    if (!ctx.user) {
        throw new Error("Authentication required");
    }
    return ctx.user;
}
