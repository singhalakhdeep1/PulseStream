# FeedFlow — Real-Time Social Feed Platform

A social feed platform built for 10M+ users with fan-out-on-write feed algorithm, Redis pre-computed feeds, virtual-DOM infinite scroll, and real-time WebSocket presence.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Client                          │
│  Next.js 15 App Router + React Server Components   │
│  TanStack Query v5 (optimistic updates)            │
│  react-window (virtual scroll 10K+ posts)          │
│  Zustand (useAppStore + useUIStore)                │
└────────────────────┬────────────────────────────────┘
                     │ API Routes
┌────────────────────▼────────────────────────────────┐
│              Next.js API Layer                      │
│  Rate limiting: Upstash Ratelimit (100/min)         │
│  Auth: Supabase SSR @supabase/ssr                   │
└──────┬───────────────────┬──────────────────────────┘
       │                   │
┌──────▼──────┐    ┌───────▼───────┐
│  Supabase   │    │ Upstash Redis │
│  PostgreSQL │    │ Pre-computed  │
│  + RLS      │    │ feed_items    │
│  + Realtime │    │ per userId    │
│  + Storage  │    └───────────────┘
└──────┬──────┘
       │ DB Trigger (on post INSERT)
       ▼
  fanout_post_to_followers()
  → INSERT INTO feed_items for each follower
```

### Fan-Out-On-Write

A PostgreSQL trigger fires on every `posts` INSERT and distributes the post to every follower's `feed_items` table. Combined with Upstash Redis caching the first page of each user's feed (TTL 5min), feed reads are consistently <50ms.

### Cursor-Based Pagination

All feed queries use `(created_at, post_id)` tuple cursors — never OFFSET — ensuring stable pagination under high write throughput.

### Virtual Scroll

`react-window` renders only visible post cards, maintaining 60fps with 10,000+ posts loaded. Blurhash placeholders prevent layout shift on image load.

---

## Tech Stack

| Layer         | Technology                              |
| ------------- | --------------------------------------- |
| Framework     | Next.js 15.3 (App Router, Turbopack)    |
| Language      | TypeScript 5 (strict mode)              |
| Database      | Supabase PostgreSQL + RLS               |
| Auth          | Supabase Auth (email/password + OAuth)  |
| Realtime      | Supabase Realtime (WebSocket)           |
| Cache         | Upstash Redis (fan-out feeds)           |
| Media         | Cloudflare Images (CDN variants)        |
| AI            | OpenAI GPT-4o-mini (content moderation) |
| Search        | PostgreSQL tsvector + GIN + pg_trgm     |
| Email         | Resend                                  |
| Payments      | Stripe (Pro subscriptions)              |
| Observability | Sentry + PostHog                        |
| Styling       | Tailwind CSS 3.4                        |
| State         | Zustand v5 + TanStack Query v5          |
| Testing       | Vitest + Playwright                     |
| CI/CD         | GitHub Actions + Vercel                 |

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Cloudflare Images
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=

# OpenAI
OPENAI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=

# Resend
RESEND_API_KEY=

# Sentry
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment
cp .env.example .env.local
# Fill in your credentials

# 3. Run Supabase migrations
npx supabase db push

# 4. Start development server
pnpm dev
```

## Database Schema

Key tables:

- `profiles` — user data, subscription tier, follower/following counts
- `posts` — content, media_urls (JSONB), likes/reposts/comments counts
- `feed_items` — pre-computed per-user feed (fan-out-on-write)
- `follows` — follower/following graph
- `likes`, `reposts` — engagement
- `stories` — 24hr expiring media (pg_cron auto-expiry)
- `notifications` — real-time notification feed
- `conversations`, `messages` — DM system
- `bookmarks` — saved posts

## Performance Targets

| Metric             | Target              |
| ------------------ | ------------------- |
| Feed read P50      | <50ms               |
| Feed read P99      | <200ms              |
| Time to First Byte | <100ms              |
| Lighthouse Score   | >90                 |
| Concurrent users   | 10M+ (Redis-backed) |

---

## 📝 License

Proprietary - All rights reserved.
