const GQL_ENDPOINT =
    typeof window !== "undefined"
        ? "/api/graphql"
        : (process.env.SHELL_INTERNAL_URL ?? "http://localhost:3000") + "/api/graphql";

export async function gqlFetch<TData = unknown, TVariables = Record<string, unknown>>(
    query: string,
    variables?: TVariables
): Promise<TData> {
    const res = await fetch(GQL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`);
    const json = await res.json() as { data?: TData; errors?: Array<{ message: string }> };
    if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join(", "));
    if (!json.data) throw new Error("No data returned from GraphQL");
    return json.data;
}
