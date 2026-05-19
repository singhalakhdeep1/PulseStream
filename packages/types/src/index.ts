// ─── @feedflow/types ────────────────────────────────────────────────────────
// Shared TypeScript contracts across all MFEs and the shell.
// No runtime code — pure type declarations.

// ── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
    id: string;
    email: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    bio: string | null;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    isVerified: boolean;
    createdAt: string;
}

// ── Posts ─────────────────────────────────────────────────────────────────────
export type PostVisibility = "public" | "followers" | "private";

export interface Post {
    id: string;
    authorId: string;
    author?: AuthUser;
    content: string;
    imageUrls: string[];
    hashtags: string[];
    mentionedUsers: string[];
    visibility: PostVisibility;
    likesCount: number;
    commentsCount: number;
    repostsCount: number;
    isLiked?: boolean;
    isBookmarked?: boolean;
    isRepost: boolean;
    originalPostId?: string;
    originalPost?: Post;
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    id: string;
    postId: string;
    authorId: string;
    author?: AuthUser;
    content: string;
    likesCount: number;
    isLiked?: boolean;
    parentCommentId?: string;
    replies?: Comment[];
    createdAt: string;
}

// ── Stories ───────────────────────────────────────────────────────────────────
export interface Story {
    id: string;
    authorId: string;
    author?: AuthUser;
    mediaUrl: string;
    mediaType: "image" | "video";
    viewsCount: number;
    expiresAt: string;
    createdAt: string;
    isViewed?: boolean;
}

// ── Notifications ─────────────────────────────────────────────────────────────
export type NotificationType = "like" | "comment" | "follow" | "mention" | "repost";

export interface Notification {
    id: string;
    userId: string;
    actorId: string;
    actor?: AuthUser;
    type: NotificationType;
    postId?: string;
    post?: Post;
    isRead: boolean;
    createdAt: string;
}

// ── Messages ──────────────────────────────────────────────────────────────────
export interface Conversation {
    id: string;
    participants: AuthUser[];
    lastMessage?: Message;
    unreadCount: number;
    updatedAt: string;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    sender?: AuthUser;
    content: string;
    mediaUrl?: string;
    isRead: boolean;
    createdAt: string;
}

// ── Feed ──────────────────────────────────────────────────────────────────────
export type FeedAlgorithm = "CHRONOLOGICAL" | "RANKED" | "FOLLOWING";

export interface FeedResult {
    posts: Post[];
    hasNextPage: boolean;
    totalCount: number;
    nextCursor?: string;
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface PageInfo {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
}

export interface Connection<T> {
    edges: Array<{ node: T; cursor: string }>;
    pageInfo: PageInfo;
    totalCount: number;
}

// ── Module Federation contract types ─────────────────────────────────────────
// Each MFE exposes these surface types so the shell can type-check remote imports.

export interface FeedMFEExports {
    FeedPage: React.ComponentType<{ algorithm?: FeedAlgorithm }>;
    CreatePostModal: React.ComponentType<{ open: boolean; onClose: () => void }>;
    FeedWidget: React.ComponentType<{ limit?: number }>;
}

export interface MessagesMFEExports {
    MessagesPage: React.ComponentType;
    ConversationView: React.ComponentType<{ conversationId: string }>;
    MessagesBadge: React.ComponentType;
}

export interface NotificationsMFEExports {
    NotificationsPage: React.ComponentType;
    NotificationsBell: React.ComponentType;
    NotificationsDropdown: React.ComponentType<{ open: boolean; onClose: () => void }>;
}

export interface ProfileMFEExports {
    ProfilePage: React.ComponentType<{ username: string }>;
    ProfileCard: React.ComponentType<{ userId: string }>;
    EditProfileModal: React.ComponentType<{ open: boolean; onClose: () => void }>;
}
