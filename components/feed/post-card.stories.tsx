import type { Meta, StoryObj } from "@storybook/react";
import { PostCard } from "@/components/feed/post-card";
import type { Post } from "@/types";

const mockPost: Post = {
    id: "post-1",
    content: "Just shipped the fan-out-on-write feed engine 🚀 Sub-5ms feed reads at 100k followers!",
    created_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    like_count: 142,
    comment_count: 18,
    repost_count: 31,
    is_liked: false,
    is_bookmarked: false,
    media_urls: [],
    author: {
        id: "user-1",
        username: "devlead",
        full_name: "Alex Rivera",
        avatar_url: "https://ui-avatars.com/api/?name=Alex+Rivera&background=6366f1&color=fff",
        is_verified: true,
    },
};

const meta: Meta<typeof PostCard> = {
    title: "Feed/PostCard",
    component: PostCard,
    tags: ["autodocs"],
    args: {
        post: mockPost,
        currentUserId: "current-user",
        onLike: () => { },
    },
    parameters: {
        layout: "padded",
        nextjs: { appDirectory: true },
    },
};

export default meta;
type Story = StoryObj<typeof PostCard>;

export const Default: Story = {};

export const Liked: Story = {
    args: { post: { ...mockPost, is_liked: true, like_count: 143 } },
};

export const WithMedia: Story = {
    args: {
        post: {
            ...mockPost,
            content: "New UI for the Kanban board 👀",
            media_urls: ["https://picsum.photos/seed/feedflow/800/450"],
        },
    },
};

export const LongContent: Story = {
    args: {
        post: {
            ...mockPost,
            content:
                "Thread: how we reduced p99 feed latency from 340ms to 4ms using fan-out-on-write + Redis sorted sets. A deep dive into the architecture, trade-offs, and why we chose PostgreSQL triggers over a separate message queue...",
        },
    },
};
