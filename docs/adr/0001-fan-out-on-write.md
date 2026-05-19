# ADR 0001 — Fan-Out-on-Write for Feed Delivery

**Date:** 2025-01  
**Status:** Accepted

## Context

We need a feed delivery model. The two canonical approaches:

| Model            | Read path                            | Write path                                   | Best for                       |
| ---------------- | ------------------------------------ | -------------------------------------------- | ------------------------------ |
| Fan-out-on-write | O(1) — read pre-built feed           | O(followers) — write to each follower's feed | Read-heavy social apps         |
| Fan-out-on-read  | O(following) — assemble at read time | O(1) — just insert post                      | Celebrity accounts, low-volume |

## Decision

**Fan-out-on-write** via a PostgreSQL trigger (`fanout_post_to_followers`).

On INSERT to `posts`:

1. Trigger fires, queries `followers` table for all follower user IDs
2. Bulk-inserts rows into `feed_items` (one per follower)
3. Each feed row is `(follower_id, post_id, created_at)`

Pre-computed feeds are cached in **Upstash Redis** as sorted sets keyed by `feed:{userId}`, scored by timestamp.

## Consequences

**Positive:** Feed reads are sub-5ms (Redis ZREVRANGE). No aggregation at read time.  
**Negative:** Users with 10M+ followers would cause massive write fan-outs. **Mitigation:** For users with >10k followers, switch to hybrid model — fan-out to top 10k active followers, others get fan-on-read. Implemented in `app/api/posts/route.ts`.
