import { Redis } from "@upstash/redis";

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set");
}

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Key helpers
export const CACHE_KEYS = {
    feed: (userId: string) => `feed:${userId}`,
    profile: (username: string) => `profile:${username}`,
    trending: () => "trending:hashtags",
    postLikes: (postId: string) => `post:${postId}:likes`,
    userLikes: (userId: string) => `user:${userId}:likes`,
    // Like batching bucket (flush every 5s)
    likeBatch: () => "likes:pending_batch",
} as const;

export const CACHE_TTL = {
    feed: 60 * 5,       // 5 min
    profile: 60 * 10,   // 10 min
    trending: 60 * 15,  // 15 min
} as const;
