import { redis } from "./client";
import { FEED_PAGE_SIZE } from "@/lib/constants";

const FEED_TTL = 300; // 5 minutes

export function feedKey(userId: string) {
    return `feed:${userId}`;
}

export async function getFeedFromCache(userId: string, cursor?: string): Promise<string[] | null> {
    const key = feedKey(userId);
    const raw = await redis.get<string[]>(key);
    if (!raw) return null;
    if (!cursor) return raw.slice(0, FEED_PAGE_SIZE);
    const idx = raw.indexOf(cursor);
    if (idx === -1) return null;
    return raw.slice(idx + 1, idx + 1 + FEED_PAGE_SIZE);
}

export async function cacheFeed(userId: string, postIds: string[]): Promise<void> {
    await redis.setex(feedKey(userId), FEED_TTL, postIds);
}

export async function invalidateFeed(userId: string): Promise<void> {
    await redis.del(feedKey(userId));
}
