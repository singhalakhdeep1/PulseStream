# ADR 0002 — Cursor-Based Pagination over OFFSET

**Date:** 2025-01  
**Status:** Accepted

## Context

Feed and search results need pagination. Two approaches: OFFSET-based vs. cursor-based.

## Decision

**Cursor-based pagination** using a composite `(created_at, post_id)` tuple.

```sql
-- Cursor query (next page):
SELECT * FROM feed_items
WHERE (created_at, post_id) < ($cursor_created_at, $cursor_post_id)
ORDER BY created_at DESC, post_id DESC
LIMIT 20;
```

The cursor is base64-encoded and returned as `nextCursor` in the API response.

## Why Not OFFSET?

| Problem                       | OFFSET                        | Cursor                                       |
| ----------------------------- | ----------------------------- | -------------------------------------------- |
| Performance at page 1000      | ❌ O(n) rows skanned          | ✅ O(1) via index seek                       |
| New post inserted mid-session | ❌ Duplicate row on next page | ✅ Stable — cursor anchors to exact position |
| Database load                 | ❌ Scales linearly            | ✅ Constant                                  |

## Consequences

Cursor pagination cannot support "jump to page N". Accepted — infinite scroll UX doesn't need it.
