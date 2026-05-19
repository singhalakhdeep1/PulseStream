// ─── Shared GraphQL client for feed-mfe ──────────────────────────────────────
// All MFEs hit the same GraphQL BFF hosted by the shell (/api/graphql).
// The shell URL is an env var so each MFE can reach it in both dev and prod.

const GQL_ENDPOINT =
    typeof window !== "undefined"
        ? "/api/graphql"                                    // browser → same-origin (shell proxies)
        : (process.env.SHELL_INTERNAL_URL ?? "http://localhost:3000") + "/api/graphql"; // SSR

export async function gqlFetch<TData = unknown, TVariables = Record<string, unknown>>(
    query: string,
    variables?: TVariables
): Promise<TData> {
    const res = await fetch(GQL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",  // forward auth cookies
        body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`);

    const json = await res.json() as { data?: TData; errors?: Array<{ message: string }> };
    if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join(", "));
    if (!json.data) throw new Error("No data returned from GraphQL");

    return json.data;
}
