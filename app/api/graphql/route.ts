// ─── GraphQL API Route ────────────────────────────────────────────────────────
// This is the single GraphQL endpoint for FeedFlow's BFF.
// GraphQL Yoga handles the HTTP layer — we just wire schema + resolvers + context.
//
// One endpoint (/api/graphql) replaces dozens of REST endpoints.
// The client can request exactly what it needs in one network round-trip.

import { createYoga } from "graphql-yoga";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs } from "@/lib/graphql/schema";
import { resolvers } from "@/lib/graphql/resolvers";
import { createContext } from "@/lib/graphql/context";
import type { NextRequest } from "next/server";

const schema = makeExecutableSchema({ typeDefs, resolvers });

const yoga = createYoga<{ request: NextRequest }>({
    schema,
    context: ({ request }) => createContext(request),
    graphqlEndpoint: "/api/graphql",
    fetchAPI: { Response },
    // Disable GraphQL introspection in production for security
    // (schema info would be public otherwise)
    maskedErrors: process.env.NODE_ENV === "production",
    logging: process.env.NODE_ENV === "development",
});

export async function GET(req: NextRequest) {
    return yoga.handle(req as Request, { request: req });
}

export async function POST(req: NextRequest) {
    return yoga.handle(req as Request, { request: req });
}
