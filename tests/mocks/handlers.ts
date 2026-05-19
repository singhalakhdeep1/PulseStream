/**
 * FeedFlow — MSW v2 request handlers
 *
 * Intercepts Supabase REST, PostHog, and internal API calls during tests.
 * Skill: Mock Service Worker v2 (msw)
 */

import { http, HttpResponse } from "msw";

const API = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://mock.supabase.co";

export const handlers = [
    // ── Posts ──────────────────────────────────────────────────────────────────

    http.get(`${API}/rest/v1/posts`, () => {
        return HttpResponse.json([
            {
                id: "post-1",
                content: "Hello world!",
                user_id: "user-1",
                like_count: 5,
                comment_count: 2,
                repost_count: 1,
                is_liked: false,
                created_at: new Date().toISOString(),
                author: { id: "user-1", username: "testuser", full_name: "Test User", avatar_url: null },
                media: [],
            },
        ]);
    }),

    http.post(`${API}/rest/v1/posts`, async ({ request }) => {
        const body = await request.json() as Record<string, unknown>;
        return HttpResponse.json({ id: "post-new", like_count: 0, comment_count: 0, ...body }, { status: 201 });
    }),

    http.post(`${API}/rest/v1/likes`, () => {
        return HttpResponse.json({ id: "like-1" }, { status: 201 });
    }),

    http.delete(`${API}/rest/v1/likes`, () => {
        return new HttpResponse(null, { status: 204 });
    }),

    // ── Profiles ───────────────────────────────────────────────────────────────

    http.get(`${API}/rest/v1/profiles`, () => {
        return HttpResponse.json([
            { id: "user-1", username: "testuser", full_name: "Test User", avatar_url: null, bio: "" },
        ]);
    }),

    // ── Stories ───────────────────────────────────────────────────────────────

    http.get(`${API}/rest/v1/stories`, () => {
        return HttpResponse.json([]);
    }),

    // ── Internal API routes ────────────────────────────────────────────────────

    http.post("/api/posts", async ({ request }) => {
        const body = await request.json() as Record<string, unknown>;
        return HttpResponse.json({ id: "post-new", ...body });
    }),

    // ── PostHog (analytics — swallow in tests) ─────────────────────────────────

    http.post("https://app.posthog.com/capture/", () => {
        return new HttpResponse(null, { status: 200 });
    }),
];
