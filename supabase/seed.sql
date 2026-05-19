-- FeedFlow Seed Data
-- Inserts demo profiles, posts, hashtags, follows, and likes

-- Demo users (passwords set via Supabase Auth dashboard or CLI)
-- These UUIDs must match auth.users entries
DO $$
DECLARE
  alice_id UUID := '11111111-1111-1111-1111-111111111111';
  bob_id   UUID := '22222222-2222-2222-2222-222222222222';
  carol_id UUID := '33333333-3333-3333-3333-333333333333';
BEGIN

INSERT INTO profiles (id, username, full_name, bio, is_verified) VALUES
  (alice_id, 'alice_dev', 'Alice Chen', 'Senior Engineer @ Google. Building the web, one byte at a time. 🚀', TRUE),
  (bob_id,   'bob_builds', 'Bob Martinez', 'Indie hacker. Shipped 10+ products. Previously @ Stripe.', FALSE),
  (carol_id, 'carol_codes', 'Carol Williams', 'Frontend wizard. Open source contributor. Coffee-driven development ☕', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Follows
INSERT INTO follows (follower_id, following_id) VALUES
  (alice_id, bob_id),
  (alice_id, carol_id),
  (bob_id, alice_id),
  (carol_id, alice_id),
  (carol_id, bob_id)
ON CONFLICT DO NOTHING;

-- Posts
WITH p1 AS (
  INSERT INTO posts (author_id, content) VALUES
    (alice_id, 'Just shipped pgvector HNSW indexes to production. Query time: 800ms → 40ms. The secret? Tuning ef_construction and m parameters correctly. Thread 🧵')
  RETURNING id
),
p2 AS (
  INSERT INTO posts (author_id, content) VALUES
    (bob_id, 'Hot take: cursor-based pagination is a non-negotiable for any app with more than 10k rows. OFFSET pagination is O(offset) at the database level. Stop using it.')
  RETURNING id
),
p3 AS (
  INSERT INTO posts (author_id, content) VALUES
    (carol_id, 'Built my first Supabase Realtime subscription today. WebSocket channels, presence tracking, and live cursors in 50 lines of code. Genuinely impressed.')
  RETURNING id
)
SELECT 1;

-- Hashtags
INSERT INTO hashtags (tag) VALUES
  ('pgvector'), ('supabase'), ('nextjs'), ('typescript'), ('realtimedb'), ('buildinpublic')
ON CONFLICT (tag) DO NOTHING;

END $$;
