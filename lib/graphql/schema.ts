// ─── GraphQL Type Definitions (SDL) ──────────────────────────────────────────
// This is the schema for FeedFlow's GraphQL BFF (Backend For Frontend).
//
// A GraphQL BFF is NOT a public API. It's a server-side layer that:
//   1. Aggregates data from multiple sources (Supabase, Redis, 3rd-party APIs)
//   2. Tailors the shape exactly to what the frontend needs
//   3. Eliminates N+1 queries via DataLoaders
//   4. Provides a single endpoint for all frontend data needs
//
// Why GraphQL for FeedFlow?
//   - Social feeds require flexible queries (user + posts + likes + comments in one request)
//   - Clients only request what they need (no over-fetching)
//   - Real-time with subscriptions
//   - Self-documenting schema

export const typeDefs = /* GraphQL */ `
    scalar DateTime
    scalar JSON

    # ── User ─────────────────────────────────────────────────────────────────

    type User {
        id:           ID!
        username:     String!
        displayName:  String
        avatarUrl:    String
        bio:          String
        followersCount: Int!
        followingCount: Int!
        postsCount:   Int!
        isFollowing:  Boolean!   # by the authenticated viewer
        isFollowedBy: Boolean!   # does this user follow the viewer?
        joinedAt:     DateTime!
        posts(first: Int, after: String): PostConnection!
        followers(first: Int, after: String): UserConnection!
        following(first: Int, after: String): UserConnection!
    }

    # ── Post ─────────────────────────────────────────────────────────────────

    enum PostVisibility {
        PUBLIC
        FOLLOWERS
        PRIVATE
    }

    type Post {
        id:           ID!
        content:      String!
        imageUrls:    [String!]!
        author:       User!
        visibility:   PostVisibility!
        likesCount:   Int!
        commentsCount:Int!
        repostsCount: Int!
        isLiked:      Boolean!    # by the authenticated viewer
        isBookmarked: Boolean!    # by the authenticated viewer
        isRepost:     Boolean!
        originalPost: Post        # set if this is a repost
        hashtags:     [String!]!
        mentionedUsers: [User!]!
        createdAt:    DateTime!
        comments(first: Int, after: String): CommentConnection!
    }

    # ── Comment ───────────────────────────────────────────────────────────────

    type Comment {
        id:         ID!
        content:    String!
        author:     User!
        post:       Post!
        likesCount: Int!
        isLiked:    Boolean!
        createdAt:  DateTime!
        replies(first: Int, after: String): CommentConnection!
    }

    # ── Story ─────────────────────────────────────────────────────────────────

    type Story {
        id:         ID!
        author:     User!
        imageUrl:   String!
        text:       String
        duration:   Int!          # seconds
        expiresAt:  DateTime!
        isViewed:   Boolean!      # by the authenticated viewer
        viewsCount: Int!
        createdAt:  DateTime!
    }

    # ── Notification ──────────────────────────────────────────────────────────

    enum NotificationType {
        LIKE
        COMMENT
        FOLLOW
        MENTION
        REPOST
    }

    type Notification {
        id:         ID!
        type:       NotificationType!
        actor:      User!
        post:       Post
        comment:    Comment
        isRead:     Boolean!
        createdAt:  DateTime!
    }

    # ── Message / DM ──────────────────────────────────────────────────────────

    type Conversation {
        id:           ID!
        participants: [User!]!
        lastMessage:  Message
        unreadCount:  Int!
        updatedAt:    DateTime!
        messages(first: Int, after: String): MessageConnection!
    }

    type Message {
        id:           ID!
        content:      String!
        sender:       User!
        conversation: Conversation!
        isRead:       Boolean!
        createdAt:    DateTime!
    }

    # ── Pagination (Relay-style cursor pagination) ─────────────────────────────

    type PageInfo {
        hasNextPage:     Boolean!
        hasPreviousPage: Boolean!
        startCursor:     String
        endCursor:       String
    }

    type PostConnection {
        edges:    [PostEdge!]!
        pageInfo: PageInfo!
        totalCount: Int!
    }

    type PostEdge {
        node:   Post!
        cursor: String!
    }

    type CommentConnection {
        edges:    [CommentEdge!]!
        pageInfo: PageInfo!
    }

    type CommentEdge {
        node:   Comment!
        cursor: String!
    }

    type UserConnection {
        edges:    [UserEdge!]!
        pageInfo: PageInfo!
        totalCount: Int!
    }

    type UserEdge {
        node:   User!
        cursor: String!
    }

    type MessageConnection {
        edges:    [MessageEdge!]!
        pageInfo: PageInfo!
    }

    type MessageEdge {
        node:   Message!
        cursor: String!
    }

    # ── Feed ─────────────────────────────────────────────────────────────────

    enum FeedAlgorithm {
        CHRONOLOGICAL  # newest first
        RANKED         # engagement-ranked (ML model)
        FOLLOWING      # only people you follow
    }

    type FeedResult {
        posts:    PostConnection!
        algorithm:FeedAlgorithm!
    }

    # ── Explore ───────────────────────────────────────────────────────────────

    type TrendingTopic {
        hashtag:   String!
        postsCount:Int!
        trend:     String!  # "up" | "down" | "stable"
    }

    type ExploreResult {
        trending:         [TrendingTopic!]!
        suggestedUsers:   [User!]!
        featuredPosts:    [Post!]!
    }

    # ── Queries ───────────────────────────────────────────────────────────────

    type Query {
        # Viewer
        me: User

        # Users
        user(username: String!): User
        searchUsers(query: String!, first: Int): UserConnection!

        # Feed
        feed(algorithm: FeedAlgorithm, first: Int, after: String): FeedResult!

        # Posts
        post(id: ID!): Post
        trendingPosts(first: Int, after: String): PostConnection!
        bookmarkedPosts(first: Int, after: String): PostConnection!
        postsByHashtag(hashtag: String!, first: Int, after: String): PostConnection!

        # Stories
        stories: [Story!]!

        # Notifications
        notifications(first: Int, after: String): [Notification!]!
        unreadNotificationCount: Int!

        # Messages
        conversations(first: Int, after: String): [Conversation!]!
        conversation(id: ID!): Conversation

        # Explore
        explore: ExploreResult!
    }

    # ── Mutations ─────────────────────────────────────────────────────────────

    input CreatePostInput {
        content:    String!
        imageUrls:  [String!]
        visibility: PostVisibility
        hashtags:   [String!]
    }

    input UpdatePostInput {
        content:    String
        visibility: PostVisibility
    }

    type PostPayload {
        post:   Post
        errors: [String!]!
    }

    type Mutation {
        # Posts
        createPost(input: CreatePostInput!): PostPayload!
        updatePost(id: ID!, input: UpdatePostInput!): PostPayload!
        deletePost(id: ID!): Boolean!
        likePost(id: ID!): Post!
        unlikePost(id: ID!): Post!
        bookmarkPost(id: ID!): Post!
        unbookmarkPost(id: ID!): Post!
        repost(id: ID!): Post!

        # Comments
        createComment(postId: ID!, content: String!): Comment!
        likeComment(id: ID!): Comment!

        # Users
        followUser(id: ID!): User!
        unfollowUser(id: ID!): User!
        updateProfile(displayName: String, bio: String, avatarUrl: String): User!

        # Stories
        createStory(imageUrl: String!, text: String, duration: Int): Story!
        viewStory(id: ID!): Story!

        # Messages
        sendMessage(conversationId: ID!, content: String!): Message!
        startConversation(userId: ID!, content: String!): Conversation!
        markConversationRead(id: ID!): Conversation!

        # Notifications
        markNotificationRead(id: ID!): Notification!
        markAllNotificationsRead: Boolean!
    }
`;
