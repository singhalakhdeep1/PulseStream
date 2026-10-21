// ─── GraphQL Resolvers ────────────────────────────────────────────────────────
// Resolvers are thin functions. Their only job: fetch data and return it.
// All business logic (auth, validation, rate limiting) is in the context.
//
// Structure:
//   Query resolvers     — read-only data fetching
//   Mutation resolvers  — writes + side effects
//   Type resolvers      — field-level resolvers for nested types (use DataLoaders)

import { requireAuth } from "./context";
import type { GraphQLContext } from "./context";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a Relay-style cursor-paginated connection from Supabase rows */
function toConnection<T extends { id: string; created_at: string }>(
    rows: T[],
    hasNextPage: boolean,
    totalCount = 0
) {
    const edges = rows.map(node => ({
        node,
        cursor: Buffer.from(node.created_at).toString("base64"),
    }));
    return {
        edges,
        pageInfo: {
            hasNextPage,
            hasPreviousPage: false,
            startCursor: edges[0]?.cursor ?? null,
            endCursor: edges[edges.length - 1]?.cursor ?? null,
        },
        totalCount,
    };
}

function parseCursor(cursor: string | null | undefined): string | null {
    if (!cursor) return null;
    try { return Buffer.from(cursor, "base64").toString("utf-8"); } catch { return null; }
}

// ── Type Resolvers ─────────────────────────────────────────────────────────────
// These use DataLoaders to batch-load nested fields and avoid N+1 queries.

const UserType = {
    isFollowing: async (user: any, _: unknown, ctx: GraphQLContext) => {
        if (!ctx.user) return false;
        const { data } = await ctx.supabase
            .from("follows")
            .select("id")
            .eq("follower_id", ctx.user.id)
            .eq("following_id", user.id)
            .maybeSingle();
        return !!data;
    },
    isFollowedBy: async (user: any, _: unknown, ctx: GraphQLContext) => {
        if (!ctx.user) return false;
        const { data } = await ctx.supabase
            .from("follows")
            .select("id")
            .eq("follower_id", user.id)
            .eq("following_id", ctx.user.id)
            .maybeSingle();
        return !!data;
    },
    followersCount: (user: any) => user.followers_count ?? 0,
    followingCount: (user: any) => user.following_count ?? 0,
    postsCount: (user: any) => user.posts_count ?? 0,
    displayName: (user: any) => user.display_name ?? null,
    avatarUrl: (user: any) => user.avatar_url ?? null,
    joinedAt: (user: any) => user.created_at,
    posts: async (user: any, args: any, ctx: GraphQLContext) => {
        const limit = Math.min(args.first ?? 20, 50);
        const { data } = await ctx.supabase
            .from("posts")
            .select("*")
            .eq("author_id", user.id)
            .order("created_at", { ascending: false })
            .limit(limit + 1);
        const rows = (data ?? []) as any[];
        const hasMore = rows.length > limit;
        return toConnection(hasMore ? rows.slice(0, limit) : rows, hasMore);
    },
    followers: async (user: any, args: any, ctx: GraphQLContext) => {
        const limit = Math.min(args.first ?? 20, 50);
        const { data } = await ctx.supabase
            .from("follows")
            .select("follower:profiles!follower_id(*)")
            .eq("following_id", user.id)
            .limit(limit + 1);
        const rows = ((data ?? []) as any[]).map((r: any) => r.follower);
        const hasMore = rows.length > limit;
        return toConnection(hasMore ? rows.slice(0, limit) : rows, hasMore);
    },
    following: async (user: any, args: any, ctx: GraphQLContext) => {
        const limit = Math.min(args.first ?? 20, 50);
        const { data } = await ctx.supabase
            .from("follows")
            .select("following:profiles!following_id(*)")
            .eq("follower_id", user.id)
            .limit(limit + 1);
        const rows = ((data ?? []) as any[]).map((r: any) => r.following);
        const hasMore = rows.length > limit;
        return toConnection(hasMore ? rows.slice(0, limit) : rows, hasMore);
    },
};

const PostType = {
    author: (post: any, _: unknown, ctx: GraphQLContext) =>
        ctx.loaders.user.loadSingle(post.author_id),
    imageUrls: (post: any) => post.image_urls ?? [],
    hashtags: (post: any) => post.hashtags ?? [],
    mentionedUsers: async (post: any, _: unknown, ctx: GraphQLContext) => {
        if (!post.mentioned_user_ids?.length) return [];
        return Promise.all(post.mentioned_user_ids.map((id: string) => ctx.loaders.user.loadSingle(id)));
    },
    likesCount: (post: any) => post.likes_count ?? 0,
    commentsCount: (post: any) => post.comments_count ?? 0,
    repostsCount: (post: any) => post.reposts_count ?? 0,
    createdAt: (post: any) => post.created_at,
    isLiked: async (post: any, _: unknown, ctx: GraphQLContext) => {
        if (!ctx.user) return false;
        const { data } = await ctx.supabase
            .from("likes")
            .select("id")
            .eq("post_id", post.id)
            .eq("user_id", ctx.user.id)
            .maybeSingle();
        return !!data;
    },
    isBookmarked: async (post: any, _: unknown, ctx: GraphQLContext) => {
        if (!ctx.user) return false;
        const { data } = await ctx.supabase
            .from("bookmarks")
            .select("id")
            .eq("post_id", post.id)
            .eq("user_id", ctx.user.id)
            .maybeSingle();
        return !!data;
    },
    isRepost: (post: any) => !!post.original_post_id,
    originalPost: (post: any, _: unknown, ctx: GraphQLContext) =>
        post.original_post_id ? ctx.loaders.post.loadSingle(post.original_post_id) : null,
    comments: async (post: any, args: any, ctx: GraphQLContext) => {
        const limit = Math.min(args.first ?? 20, 50);
        const { data } = await ctx.supabase
            .from("comments")
            .select("*")
            .eq("post_id", post.id)
            .is("parent_id", null)
            .order("created_at", { ascending: true })
            .limit(limit + 1);
        const rows = (data ?? []) as any[];
        const hasMore = rows.length > limit;
        return toConnection(hasMore ? rows.slice(0, limit) : rows, hasMore);
    },
};

const CommentType = {
    author: (comment: any, _: unknown, ctx: GraphQLContext) => ctx.loaders.user.loadSingle(comment.author_id),
    post: (comment: any, _: unknown, ctx: GraphQLContext) => ctx.loaders.post.loadSingle(comment.post_id),
    likesCount: (comment: any) => comment.likes_count ?? 0,
    createdAt: (comment: any) => comment.created_at,
    isLiked: async (comment: any, _: unknown, ctx: GraphQLContext) => {
        if (!ctx.user) return false;
        const { data } = await ctx.supabase
            .from("comment_likes")
            .select("id")
            .eq("comment_id", comment.id)
            .eq("user_id", ctx.user.id)
            .maybeSingle();
        return !!data;
    },
    replies: async (comment: any, args: any, ctx: GraphQLContext) => {
        const limit = Math.min(args.first ?? 10, 50);
        const { data } = await ctx.supabase
            .from("comments")
            .select("*")
            .eq("parent_id", comment.id)
            .order("created_at", { ascending: true })
            .limit(limit + 1);
        const rows = (data ?? []) as any[];
        const hasMore = rows.length > limit;
        return toConnection(hasMore ? rows.slice(0, limit) : rows, hasMore);
    },
};

const NotificationType = {
    actor: (n: any, _: unknown, ctx: GraphQLContext) => ctx.loaders.user.loadSingle(n.actor_id),
    post: (n: any, _: unknown, ctx: GraphQLContext) => n.post_id ? ctx.loaders.post.loadSingle(n.post_id) : null,
    comment: (n: any, _: unknown, ctx: GraphQLContext) =>
        n.comment_id ? ctx.loaders.comment.loadSingle(n.comment_id) : null,
    isRead: (n: any) => n.is_read,
    createdAt: (n: any) => n.created_at,
};

// ── Query Resolvers ───────────────────────────────────────────────────────────

const Query = {
    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
        if (!ctx.user) return null;
        return ctx.loaders.user.loadSingle(ctx.user.id);
    },

    user: async (_: unknown, args: { username: string }, ctx: GraphQLContext) => {
        const { data } = await ctx.supabase
            .from("profiles")
            .select("*")
            .eq("username", args.username)
            .maybeSingle();
        return data;
    },

    searchUsers: async (_: unknown, args: { query: string; first?: number }, ctx: GraphQLContext) => {
        const limit = Math.min(args.first ?? 20, 50);
        const { data } = await ctx.supabase
            .from("profiles")
            .select("*")
            .or(`username.ilike.%${args.query}%,display_name.ilike.%${args.query}%`)
            .limit(limit + 1);
        const rows = (data ?? []) as any[];
        const hasMore = rows.length > limit;
        return toConnection(hasMore ? rows.slice(0, limit) : rows, hasMore);
    },

    feed: async (_: unknown, args: { algorithm?: string; first?: number; after?: string }, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        const limit = Math.min(args.first ?? 20, 50);
        const cursor = parseCursor(args.after);

        let query = ctx.supabase
            .from("posts")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit + 1);

        // FOLLOWING algorithm: only show posts from people you follow
        if (!args.algorithm || args.algorithm === "FOLLOWING") {
            const { data: follows } = await ctx.supabase
                .from("follows")
                .select("following_id")
                .eq("follower_id", viewer.id);
            const followingIds = (follows ?? []).map((f: any) => f.following_id);
            if (followingIds.length > 0) {
                query = query.in("author_id", [...followingIds, viewer.id]);
            } else {
                query = query.eq("author_id", viewer.id);
            }
        }

        if (cursor) query = query.lt("created_at", cursor);

        const { data } = await query;
        const rows = (data ?? []) as any[];
        const hasMore = rows.length > limit;

        return {
            posts: toConnection(hasMore ? rows.slice(0, limit) : rows, hasMore),
            algorithm: args.algorithm ?? "FOLLOWING",
        };
    },

    post: async (_: unknown, args: { id: string }, ctx: GraphQLContext) =>
        ctx.loaders.post.loadSingle(args.id),

    trendingPosts: async (_: unknown, args: { first?: number; after?: string }, ctx: GraphQLContext) => {
        const limit = Math.min(args.first ?? 20, 50);
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { data } = await ctx.supabase
            .from("posts")
            .select("*")
            .eq("visibility", "PUBLIC")
            .gte("created_at", since)
            .order("likes_count", { ascending: false })
            .limit(limit + 1);

        const rows = (data ?? []) as any[];
        const hasMore = rows.length > limit;
        return toConnection(hasMore ? rows.slice(0, limit) : rows, hasMore);
    },

    bookmarkedPosts: async (_: unknown, args: { first?: number }, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        const limit = Math.min(args.first ?? 20, 50);

        const { data } = await ctx.supabase
            .from("bookmarks")
            .select("post:posts(*)")
            .eq("user_id", viewer.id)
            .order("created_at", { ascending: false })
            .limit(limit + 1);

        const rows = ((data ?? []) as any[]).map((r: any) => r.post);
        const hasMore = rows.length > limit;
        return toConnection(hasMore ? rows.slice(0, limit) : rows, hasMore);
    },

    postsByHashtag: async (_: unknown, args: { hashtag: string; first?: number }, ctx: GraphQLContext) => {
        const limit = Math.min(args.first ?? 20, 50);
        const { data } = await ctx.supabase
            .from("posts")
            .select("*")
            .contains("hashtags", [args.hashtag.replace(/^#/, "")])
            .eq("visibility", "PUBLIC")
            .order("created_at", { ascending: false })
            .limit(limit + 1);

        const rows = (data ?? []) as any[];
        const hasMore = rows.length > limit;
        return toConnection(hasMore ? rows.slice(0, limit) : rows, hasMore);
    },

    stories: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        const { data: follows } = await ctx.supabase
            .from("follows")
            .select("following_id")
            .eq("follower_id", viewer.id);

        const followingIds = (follows ?? []).map((f: any) => f.following_id);
        const { data } = await ctx.supabase
            .from("stories")
            .select("*")
            .in("author_id", [...followingIds, viewer.id])
            .gt("expires_at", new Date().toISOString())
            .order("created_at", { ascending: false });

        return data ?? [];
    },

    notifications: async (_: unknown, args: { first?: number }, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        const limit = Math.min(args.first ?? 20, 50);
        const { data } = await ctx.supabase
            .from("notifications")
            .select("*")
            .eq("user_id", viewer.id)
            .order("created_at", { ascending: false })
            .limit(limit);
        return data ?? [];
    },

    unreadNotificationCount: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        const { count } = await ctx.supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", viewer.id)
            .eq("is_read", false);
        return count ?? 0;
    },

    conversations: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        const { data } = await ctx.supabase
            .from("conversation_participants")
            .select("conversation:conversations(*)")
            .eq("user_id", viewer.id)
            .order("created_at", { ascending: false });
        return ((data ?? []) as any[]).map((r: any) => r.conversation);
    },

    conversation: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        // Ensure viewer is a participant
        const { data } = await ctx.supabase
            .from("conversation_participants")
            .select("conversation:conversations(*)")
            .eq("conversation_id", args.id)
            .eq("user_id", viewer.id)
            .maybeSingle();
        return (data as any)?.conversation ?? null;
    },

    explore: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
        const [trendingResult, usersResult, featuredResult] = await Promise.all([
            ctx.supabase
                .from("hashtags")
                .select("tag, posts_count")
                .order("posts_count", { ascending: false })
                .limit(10),
            ctx.supabase
                .from("profiles")
                .select("*")
                .order("followers_count", { ascending: false })
                .limit(5),
            ctx.supabase
                .from("posts")
                .select("*")
                .eq("visibility", "PUBLIC")
                .order("likes_count", { ascending: false })
                .limit(10),
        ]);

        return {
            trending: ((trendingResult.data ?? []) as any[]).map(r => ({
                hashtag: r.tag,
                postsCount: r.posts_count,
                trend: "stable",
            })),
            suggestedUsers: usersResult.data ?? [],
            featuredPosts: featuredResult.data ?? [],
        };
    },
};

// ── Mutation Resolvers ────────────────────────────────────────────────────────

const Mutation = {
    createPost: async (_: unknown, args: { input: any }, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        const { content, imageUrls, visibility, hashtags } = args.input;

        const { data, error } = await ctx.supabase
            .from("posts")
            .insert({
                content,
                image_urls: imageUrls ?? [],
                author_id: viewer.id,
                visibility: (visibility ?? "PUBLIC").toLowerCase(),
                hashtags: (hashtags ?? []).map((h: string) => h.replace(/^#/, "")),
                likes_count: 0,
                comments_count: 0,
                reposts_count: 0,
            })
            .select()
            .single();

        if (error) return { post: null, errors: [error.message] };
        return { post: data, errors: [] };
    },

    deletePost: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        const { error } = await ctx.supabase
            .from("posts")
            .delete()
            .eq("id", args.id)
            .eq("author_id", viewer.id);  // only delete own posts
        return !error;
    },

    likePost: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);

        // Upsert like + increment counter atomically via Supabase RPC
        await ctx.supabase.rpc("like_post", { p_post_id: args.id, p_user_id: viewer.id });

        return ctx.loaders.post.loadSingle(args.id);
    },

    unlikePost: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        await ctx.supabase.rpc("unlike_post", { p_post_id: args.id, p_user_id: viewer.id });
        return ctx.loaders.post.loadSingle(args.id);
    },

    bookmarkPost: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        await ctx.supabase
            .from("bookmarks")
            .upsert({ post_id: args.id, user_id: viewer.id }, { onConflict: "post_id,user_id" });
        return ctx.loaders.post.loadSingle(args.id);
    },

    unbookmarkPost: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        await ctx.supabase
            .from("bookmarks")
            .delete()
            .eq("post_id", args.id)
            .eq("user_id", viewer.id);
        return ctx.loaders.post.loadSingle(args.id);
    },

    repost: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        const { data, error } = await ctx.supabase
            .from("posts")
            .insert({
                content: "",
                author_id: viewer.id,
                visibility: "public",
                original_post_id: args.id,
                likes_count: 0, comments_count: 0, reposts_count: 0,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        // Increment repost counter on original
        await ctx.supabase.rpc("increment_reposts", { p_post_id: args.id });
        return data;
    },

    createComment: async (_: unknown, args: { postId: string; content: string }, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        const { data, error } = await ctx.supabase
            .from("comments")
            .insert({
                post_id: args.postId,
                author_id: viewer.id,
                content: args.content,
                likes_count: 0,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        // Increment comment counter
        await ctx.supabase.rpc("increment_comments", { p_post_id: args.postId });
        return data;
    },

    likeComment: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        await ctx.supabase
            .from("comment_likes")
            .upsert({ comment_id: args.id, user_id: viewer.id }, { onConflict: "comment_id,user_id" });
        const { data } = await ctx.supabase
            .from("comments")
            .select("*")
            .eq("id", args.id)
            .single();
        return data;
    },

    followUser: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        await ctx.supabase
            .from("follows")
            .upsert({ follower_id: viewer.id, following_id: args.id }, { onConflict: "follower_id,following_id" });

        // Create a follow notification
        await ctx.supabase
            .from("notifications")
            .insert({ user_id: args.id, actor_id: viewer.id, type: "follow", is_read: false });

        return ctx.loaders.user.loadSingle(args.id);
    },

    unfollowUser: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        await ctx.supabase
            .from("follows")
            .delete()
            .eq("follower_id", viewer.id)
            .eq("following_id", args.id);
        return ctx.loaders.user.loadSingle(args.id);
    },

    updateProfile: async (_: unknown, args: any, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        const update: Record<string, unknown> = {};
        if (args.displayName !== undefined) update.display_name = args.displayName;
        if (args.bio !== undefined) update.bio = args.bio;
        if (args.avatarUrl !== undefined) update.avatar_url = args.avatarUrl;

        const { data, error } = await ctx.supabase
            .from("profiles")
            .update(update)
            .eq("id", viewer.id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    createStory: async (_: unknown, args: any, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const { data, error } = await ctx.supabase
            .from("stories")
            .insert({
                author_id: viewer.id,
                image_url: args.imageUrl,
                text: args.text ?? null,
                duration: args.duration ?? 5,
                expires_at: expiry,
                views_count: 0,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    viewStory: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        await ctx.supabase
            .from("story_views")
            .upsert({ story_id: args.id, user_id: viewer.id }, { onConflict: "story_id,user_id" });
        await ctx.supabase.rpc("increment_story_views", { p_story_id: args.id });
        const { data } = await ctx.supabase
            .from("stories")
            .select("*")
            .eq("id", args.id)
            .single();
        return data;
    },

    sendMessage: async (_: unknown, args: { conversationId: string; content: string }, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        const { data, error } = await ctx.supabase
            .from("messages")
            .insert({
                conversation_id: args.conversationId,
                sender_id: viewer.id,
                content: args.content,
                is_read: false,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    startConversation: async (_: unknown, args: { userId: string; content: string }, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);

        // Create conversation
        const { data: conv, error } = await ctx.supabase
            .from("conversations")
            .insert({ created_by: viewer.id })
            .select()
            .single();

        if (error) throw new Error(error.message);

        // Add participants
        await ctx.supabase.from("conversation_participants").insert([
            { conversation_id: conv.id, user_id: viewer.id },
            { conversation_id: conv.id, user_id: args.userId },
        ]);

        // Send first message
        await ctx.supabase.from("messages").insert({
            conversation_id: conv.id,
            sender_id: viewer.id,
            content: args.content,
            is_read: false,
        });

        return conv;
    },

    markConversationRead: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        await ctx.supabase
            .from("messages")
            .update({ is_read: true })
            .eq("conversation_id", args.id)
            .neq("sender_id", viewer.id);
        const { data } = await ctx.supabase
            .from("conversations")
            .select("*")
            .eq("id", args.id)
            .single();
        return data;
    },

    markNotificationRead: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        const { data } = await ctx.supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", args.id)
            .eq("user_id", viewer.id)
            .select()
            .single();
        return data;
    },

    markAllNotificationsRead: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
        const viewer = requireAuth(ctx);
        const { error } = await ctx.supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", viewer.id);
        return !error;
    },
};

// ── Export all resolvers ──────────────────────────────────────────────────────

export const resolvers = {
    Query,
    Mutation,
    User: UserType,
    Post: PostType,
    Comment: CommentType,
    Notification: NotificationType,
    Story: {
        author: (s: any, _: unknown, ctx: GraphQLContext) => ctx.loaders.user.loadSingle(s.author_id),
        isViewed: async (s: any, _: unknown, ctx: GraphQLContext) => {
            if (!ctx.user) return false;
            const { data } = await ctx.supabase
                .from("story_views")
                .select("id")
                .eq("story_id", s.id)
                .eq("user_id", ctx.user.id)
                .maybeSingle();
            return !!data;
        },
        viewsCount: (s: any) => s.views_count ?? 0,
        expiresAt: (s: any) => s.expires_at,
        imageUrl: (s: any) => s.image_url,
        createdAt: (s: any) => s.created_at,
    },
};
