// ─── @feedflow/auth — shared auth utilities ──────────────────────────────────
// Re-exports from client and server modules.

export { createBrowserClient, getUser, useCurrentUser } from "./client";
export { createServerClient, requireServerAuth } from "./server";
export type { AuthUser } from "@feedflow/types";
