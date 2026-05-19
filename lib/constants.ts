export const APP_NAME = "FeedFlow";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const FEED_PAGE_SIZE = 20;
export const MAX_POST_LENGTH = 2000;
export const MAX_STORY_DURATION_HOURS = 24;
export const MAX_MEDIA_PER_POST = 4;
export const MAX_MEDIA_SIZE_MB = 20;

export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
export const SUPPORTED_VIDEO_TYPES = ["video/mp4", "video/webm"] as const;

export const NOTIFICATION_LABELS: Record<string, string> = {
    like: "liked your post",
    comment: "commented on your post",
    follow: "followed you",
    mention: "mentioned you in a post",
    reply: "replied to your comment",
};
