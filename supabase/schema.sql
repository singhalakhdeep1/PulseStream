-- ═══════════════════════════════════════════════════════════════
-- FeedFlow — Supabase PostgreSQL Schema
-- Real-Time Social Feed Platform
-- ═══════════════════════════════════════════════════════════════

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- for LIKE/ILIKE optimization
CREATE EXTENSION IF NOT EXISTS "unaccent";    -- for accent-insensitive search

-- ─── Custom Types ─────────────────────────────────────────────────────────────
CREATE TYPE post_status AS ENUM ('active', 'hidden', 'removed');
CREATE TYPE media_type AS ENUM ('image', 'video', 'gif');
CREATE TYPE notification_type AS ENUM ('like', 'comment', 'follow', 'mention', 'reply');
CREATE TYPE report_reason AS ENUM ('spam', 'hate_speech', 'violence', 'nudity', 'misinformation', 'other');

-- ─── Profiles ─────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE NOT NULL,
  full_name       TEXT NOT NULL DEFAULT '',
  bio             TEXT DEFAULT '',
  avatar_url      TEXT,
  avatar_blurhash TEXT,                     -- BlurHash placeholder
  banner_url      TEXT,
  website         TEXT,
  location        TEXT,
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  is_private      BOOLEAN NOT NULL DEFAULT FALSE,
  follower_count  INTEGER NOT NULL DEFAULT 0,
  following_count INTEGER NOT NULL DEFAULT 0,
  post_count      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Follows ──────────────────────────────────────────────────────────────────
CREATE TABLE follows (
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

-- ─── Posts ────────────────────────────────────────────────────────────────────
CREATE TABLE posts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content        TEXT NOT NULL CHECK (char_length(content) <= 2000),
  status         post_status NOT NULL DEFAULT 'active',
  like_count     INTEGER NOT NULL DEFAULT 0,
  comment_count  INTEGER NOT NULL DEFAULT 0,
  repost_count   INTEGER NOT NULL DEFAULT 0,
  view_count     INTEGER NOT NULL DEFAULT 0,
  reply_to_id    UUID REFERENCES posts(id) ON DELETE SET NULL,  -- thread replies
  repost_of_id   UUID REFERENCES posts(id) ON DELETE SET NULL,  -- reposts
  search_vector  TSVECTOR,                                       -- full-text search
  ai_moderated   BOOLEAN NOT NULL DEFAULT FALSE,
  ai_score       FLOAT,                                          -- 0.0–1.0 safety score
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Post Media ───────────────────────────────────────────────────────────────
CREATE TABLE post_media (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  media_type   media_type NOT NULL DEFAULT 'image',
  url          TEXT NOT NULL,                          -- Cloudflare Images URL
  blurhash     TEXT,                                   -- BlurHash string
  width        INTEGER,
  height       INTEGER,
  size_bytes   INTEGER,
  duration_sec FLOAT,                                  -- for videos
  sort_order   SMALLINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Hashtags ─────────────────────────────────────────────────────────────────
CREATE TABLE hashtags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag        TEXT UNIQUE NOT NULL,
  post_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE post_hashtags (
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, hashtag_id)
);

-- ─── Likes ────────────────────────────────────────────────────────────────────
CREATE TABLE likes (
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- ─── Comments ─────────────────────────────────────────────────────────────────
CREATE TABLE comments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content      TEXT NOT NULL CHECK (char_length(content) <= 500),
  parent_id    UUID REFERENCES comments(id) ON DELETE CASCADE,  -- threaded
  like_count   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Comment Likes ────────────────────────────────────────────────────────────
CREATE TABLE comment_likes (
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, comment_id)
);

-- ─── Stories (24hr auto-expiry) ───────────────────────────────────────────────
CREATE TABLE stories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  media_url    TEXT NOT NULL,
  media_type   media_type NOT NULL DEFAULT 'image',
  blurhash     TEXT,
  caption      TEXT,
  view_count   INTEGER NOT NULL DEFAULT 0,
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Story Views ──────────────────────────────────────────────────────────────
CREATE TABLE story_views (
  viewer_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  story_id   UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  viewed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (viewer_id, story_id)
);

-- ─── DM Conversations ─────────────────────────────────────────────────────────
CREATE TABLE conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_ids UUID[] NOT NULL,           -- sorted array of 2 user IDs
  last_message    TEXT,
  last_message_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL CHECK (char_length(content) <= 2000),
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Notifications ────────────────────────────────────────────────────────────
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type        notification_type NOT NULL,
  post_id     UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id  UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Reports ──────────────────────────────────────────────────────────────────
CREATE TABLE reports (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
  reason     report_reason NOT NULL,
  details    TEXT,
  resolved   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Bookmarks ────────────────────────────────────────────────────────────────
CREATE TABLE bookmarks (
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- ─── Feed Cache (Redis mirrors this, but this is the source of truth) ─────────
-- Feed entries are pre-computed: when user A follows user B,
-- user B's posts are fanned out into user A's feed table.
CREATE TABLE feed_items (
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- for cursor pagination
  PRIMARY KEY (user_id, post_id)
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════

-- Full-text search on posts (GIN index — must-have for tsvector)
CREATE INDEX idx_posts_search ON posts USING GIN (search_vector);
-- Trigram index for username search
CREATE INDEX idx_profiles_username_trgm ON profiles USING GIN (username gin_trgm_ops);
CREATE INDEX idx_profiles_full_name_trgm ON profiles USING GIN (full_name gin_trgm_ops);
-- Feed queries (most common read path)
CREATE INDEX idx_feed_items_user_created ON feed_items (user_id, created_at DESC);
-- Post lookups
CREATE INDEX idx_posts_author ON posts (author_id, created_at DESC);
CREATE INDEX idx_posts_status ON posts (status) WHERE status = 'active';
-- Notifications
CREATE INDEX idx_notifications_user ON notifications (user_id, created_at DESC) WHERE is_read = FALSE;
-- Stories expiry
CREATE INDEX idx_stories_expires ON stories (expires_at) WHERE expires_at > NOW();
CREATE INDEX idx_stories_author ON stories (author_id, created_at DESC);
-- Follows
CREATE INDEX idx_follows_following ON follows (following_id, created_at DESC);
CREATE INDEX idx_follows_follower ON follows (follower_id, created_at DESC);
-- Hashtags
CREATE INDEX idx_post_hashtags_hashtag ON post_hashtags (hashtag_id);
-- Messages
CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Update tsvector on post insert/update
CREATE OR REPLACE FUNCTION update_post_search_vector()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER posts_search_vector_update
  BEFORE INSERT OR UPDATE OF content ON posts
  FOR EACH ROW EXECUTE FUNCTION update_post_search_vector();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Fan-out: when post created, insert into follower feeds
CREATE OR REPLACE FUNCTION fanout_post_to_followers()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Insert into feed for all followers (and the author themselves)
  INSERT INTO feed_items (user_id, post_id, created_at)
  SELECT follower_id, NEW.id, NEW.created_at
  FROM follows
  WHERE following_id = NEW.author_id
  ON CONFLICT DO NOTHING;

  -- Also add to author's own feed
  INSERT INTO feed_items (user_id, post_id, created_at)
  VALUES (NEW.author_id, NEW.id, NEW.created_at)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER posts_fanout_trigger
  AFTER INSERT ON posts
  FOR EACH ROW
  WHEN (NEW.status = 'active' AND NEW.reply_to_id IS NULL)
  EXECUTE FUNCTION fanout_post_to_followers();

-- Update follower/following counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = OLD.following_id;
    UPDATE profiles SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER follows_count_trigger
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Update post like count
CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER likes_count_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_like_count();

-- Update comment count
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER comments_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- Update post_count on profiles
CREATE OR REPLACE FUNCTION update_post_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.reply_to_id IS NULL THEN
    UPDATE profiles SET post_count = post_count + 1 WHERE id = NEW.author_id;
  ELSIF TG_OP = 'DELETE' AND OLD.reply_to_id IS NULL THEN
    UPDATE profiles SET post_count = GREATEST(post_count - 1, 0) WHERE id = OLD.author_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER posts_count_trigger
  AFTER INSERT OR DELETE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_post_count();

-- Expire stories (called by pg_cron every hour)
CREATE OR REPLACE FUNCTION cleanup_expired_stories()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM stories WHERE expires_at < NOW();
END;
$$;

-- Trending hashtags view
CREATE OR REPLACE VIEW trending_hashtags AS
SELECT
  h.id,
  h.tag,
  COUNT(ph.post_id) FILTER (WHERE p.created_at > NOW() - INTERVAL '24 hours') AS posts_24h,
  COUNT(ph.post_id) FILTER (WHERE p.created_at > NOW() - INTERVAL '7 days') AS posts_7d
FROM hashtags h
JOIN post_hashtags ph ON h.id = ph.hashtag_id
JOIN posts p ON ph.post_id = p.id
WHERE p.status = 'active'
GROUP BY h.id, h.tag
ORDER BY posts_24h DESC, posts_7d DESC;

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_hashtags ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, self write
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_self_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Posts: public read active posts; author can insert/update/delete
CREATE POLICY "posts_public_read" ON posts FOR SELECT USING (status = 'active');
CREATE POLICY "posts_author_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_author_update" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "posts_author_delete" ON posts FOR DELETE USING (auth.uid() = author_id);

-- Post media: public read, author insert
CREATE POLICY "post_media_public_read" ON post_media FOR SELECT USING (TRUE);
CREATE POLICY "post_media_author_insert" ON post_media FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM posts WHERE id = post_id AND author_id = auth.uid())
);

-- Hashtags: public read, authenticated insert
CREATE POLICY "hashtags_public_read" ON hashtags FOR SELECT USING (TRUE);
CREATE POLICY "hashtags_auth_insert" ON hashtags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "post_hashtags_public_read" ON post_hashtags FOR SELECT USING (TRUE);
CREATE POLICY "post_hashtags_auth_insert" ON post_hashtags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Likes: public read, self write
CREATE POLICY "likes_public_read" ON likes FOR SELECT USING (TRUE);
CREATE POLICY "likes_self_insert" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_self_delete" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Comments: public read, self write
CREATE POLICY "comments_public_read" ON comments FOR SELECT USING (TRUE);
CREATE POLICY "comments_self_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "comments_self_delete" ON comments FOR DELETE USING (auth.uid() = author_id);

-- Comment likes
CREATE POLICY "comment_likes_public_read" ON comment_likes FOR SELECT USING (TRUE);
CREATE POLICY "comment_likes_self_insert" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comment_likes_self_delete" ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- Follows: public read, self write
CREATE POLICY "follows_public_read" ON follows FOR SELECT USING (TRUE);
CREATE POLICY "follows_self_insert" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_self_delete" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Notifications: self only
CREATE POLICY "notifications_self" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_self_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Stories: public read non-expired, self write
CREATE POLICY "stories_public_read" ON stories FOR SELECT USING (expires_at > NOW());
CREATE POLICY "stories_self_insert" ON stories FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "stories_self_delete" ON stories FOR DELETE USING (auth.uid() = author_id);

-- Story views: self insert
CREATE POLICY "story_views_self_insert" ON story_views FOR INSERT WITH CHECK (auth.uid() = viewer_id);
CREATE POLICY "story_views_author_read" ON story_views FOR SELECT USING (
  auth.uid() = viewer_id OR EXISTS (SELECT 1 FROM stories WHERE id = story_id AND author_id = auth.uid())
);

-- Bookmarks: self only
CREATE POLICY "bookmarks_self" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_self_insert" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_self_delete" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Feed: self only
CREATE POLICY "feed_items_self" ON feed_items FOR SELECT USING (auth.uid() = user_id);

-- Messages & conversations: participants only
CREATE POLICY "conversations_participants" ON conversations FOR SELECT USING (auth.uid() = ANY(participant_ids));
CREATE POLICY "conversations_self_insert" ON conversations FOR INSERT WITH CHECK (auth.uid() = ANY(participant_ids));
CREATE POLICY "messages_participants" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND auth.uid() = ANY(participant_ids))
);
CREATE POLICY "messages_self_insert" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Reports: self insert
CREATE POLICY "reports_self_insert" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- ═══════════════════════════════════════════════════════════════
-- REALTIME
-- ═══════════════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE likes;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE stories;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
