// FeedFlow — Core TypeScript Types

export interface Profile {
    id: string;
    username: string;
    full_name: string;
    bio: string;
    avatar_url: string | null;
    avatar_blurhash: string | null;
    banner_url: string | null;
    website: string | null;
    location: string | null;
    is_verified: boolean;
    is_private: boolean;
    follower_count: number;
    following_count: number;
    post_count: number;
    created_at: string;
    updated_at: string;
}

export type PostStatus = "active" | "hidden" | "removed";
export type MediaType = "image" | "video" | "gif";
export type NotificationType = "like" | "comment" | "follow" | "mention" | "reply";

export interface PostMedia {
    id: string;
    post_id: string;
    media_type: MediaType;
    url: string;
    blurhash: string | null;
    width: number | null;
    height: number | null;
    size_bytes: number | null;
    duration_sec: number | null;
    sort_order: number;
    created_at: string;
}

export interface Post {
    id: string;
    author_id: string;
    content: string;
    status: PostStatus;
    like_count: number;
    comment_count: number;
    repost_count: number;
    view_count: number;
    reply_to_id: string | null;
    repost_of_id: string | null;
    ai_moderated: boolean;
    ai_score: number | null;
    created_at: string;
    updated_at: string;
    // Joined
    author?: Profile;
    media?: PostMedia[];
    hashtags?: Hashtag[];
    is_liked?: boolean;
    is_bookmarked?: boolean;
    is_reposted?: boolean;
}

export interface Comment {
    id: string;
    post_id: string;
    author_id: string;
    content: string;
    parent_id: string | null;
    like_count: number;
    created_at: string;
    updated_at: string;
    // Joined
    author?: Profile;
    is_liked?: boolean;
    replies?: Comment[];
}

export interface Story {
    id: string;
    author_id: string;
    media_url: string;
    media_type: MediaType;
    blurhash: string | null;
    caption: string | null;
    view_count: number;
    expires_at: string;
    created_at: string;
    // Joined
    author?: Profile;
    is_viewed?: boolean;
}

export interface Notification {
    id: string;
    user_id: string;
    actor_id: string | null;
    type: NotificationType;
    post_id: string | null;
    comment_id: string | null;
    is_read: boolean;
    created_at: string;
    // Joined
    actor?: Profile;
    post?: Pick<Post, "id" | "content">;
}

export interface Hashtag {
    id: string;
    tag: string;
    post_count: number;
    created_at: string;
}

export interface TrendingHashtag {
    id: string;
    tag: string;
    posts_24h: number;
    posts_7d: number;
}

export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
    // Joined
    sender?: Profile;
}

export interface Conversation {
    id: string;
    participant_ids: string[];
    last_message: string | null;
    last_message_at: string | null;
    created_at: string;
    // Joined
    other_participant?: Profile;
    unread_count?: number;
}

// Feed cursor for cursor-based pagination
export interface FeedCursor {
    created_at: string;
    post_id: string;
}

export interface PaginatedFeed {
    posts: Post[];
    nextCursor: FeedCursor | null;
    hasMore: boolean;
}

// Upload types
export interface MediaUpload {
    file: File;
    preview: string;
    blurhash?: string;
    progress: number;
}
