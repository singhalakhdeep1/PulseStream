// ─── GraphQL Client Hook ──────────────────────────────────────────────────────
// A lightweight typed GraphQL client hook using TanStack Query.
//
// Instead of a heavy client like Apollo or urql, we use a simple fetch-based
// approach with TanStack Query for caching, background refetching, and
// optimistic updates. This keeps the bundle small.
//
// Usage:
//   const { data } = useGraphQL(FEED_QUERY, { algorithm: "FOLLOWING" });

"use client";

import { useQuery, useMutation, type UseQueryOptions } from "@tanstack/react-query";

const GRAPHQL_ENDPOINT = "/api/graphql";

// ── Core fetch helper ─────────────────────────────────────────────────────────

async function gqlFetch<TData, TVariables = Record<string, unknown>>(
    query: string,
    variables?: TVariables
): Promise<TData> {
    const res = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
        credentials: "include",
    });

    const json = await res.json() as { data?: TData; errors?: Array<{ message: string }> };

    if (json.errors?.length) {
        throw new Error(json.errors.map(e => e.message).join(", "));
    }

    return json.data!;
}

// ── useGraphQL — TanStack Query wrapper ───────────────────────────────────────

export function useGraphQL<TData, TVariables = Record<string, unknown>>(
    query: string,
    variables?: TVariables,
    options?: Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">
) {
    // Hash query + variables for cache key
    const queryKey = [query, variables];

    return useQuery<TData>({
        queryKey,
        queryFn: () => gqlFetch<TData, TVariables>(query, variables),
        ...options,
    });
}

// ── useGraphQLMutation ────────────────────────────────────────────────────────

export function useGraphQLMutation<TData, TVariables = Record<string, unknown>>(
    query: string
) {
    return useMutation<TData, Error, TVariables>({
        mutationFn: (variables: TVariables) => gqlFetch<TData, TVariables>(query, variables),
    });
}

// ── Pre-built typed queries ───────────────────────────────────────────────────
// Each query function encapsulates the GraphQL query string + its types.
// This gives you full type safety without a code-gen step.

export const FEED_QUERY = /* GraphQL */ `
    query Feed($algorithm: FeedAlgorithm, $first: Int, $after: String) {
        feed(algorithm: $algorithm, first: $first, after: $after) {
            algorithm
            posts {
                edges {
                    cursor
                    node {
                        id content imageUrls createdAt
                        likesCount commentsCount repostsCount
                        isLiked isBookmarked
                        hashtags
                        author {
                            id username displayName avatarUrl
                        }
                    }
                }
                pageInfo { hasNextPage endCursor }
            }
        }
    }
`;

export const POST_QUERY = /* GraphQL */ `
    query Post($id: ID!) {
        post(id: $id) {
            id content imageUrls createdAt visibility
            likesCount commentsCount repostsCount
            isLiked isBookmarked isRepost
            hashtags
            author { id username displayName avatarUrl bio followersCount isFollowing }
            originalPost { id content author { id username avatarUrl } }
            comments(first: 20) {
                edges {
                    node {
                        id content createdAt likesCount isLiked
                        author { id username avatarUrl }
                    }
                }
                pageInfo { hasNextPage endCursor }
            }
        }
    }
`;

export const ME_QUERY = /* GraphQL */ `
    query Me {
        me {
            id username displayName avatarUrl bio
            followersCount followingCount postsCount
        }
    }
`;

export const USER_PROFILE_QUERY = /* GraphQL */ `
    query UserProfile($username: String!) {
        user(username: $username) {
            id username displayName avatarUrl bio
            followersCount followingCount postsCount
            isFollowing isFollowedBy
            posts(first: 20) {
                edges { node { id content imageUrls createdAt likesCount } }
                pageInfo { hasNextPage endCursor }
            }
        }
    }
`;

export const NOTIFICATIONS_QUERY = /* GraphQL */ `
    query Notifications($first: Int) {
        notifications(first: $first) {
            id type isRead createdAt
            actor { id username avatarUrl }
            post { id content }
        }
        unreadNotificationCount
    }
`;

export const CONVERSATIONS_QUERY = /* GraphQL */ `
    query Conversations {
        conversations {
            id unreadCount updatedAt
            participants { id username avatarUrl }
            lastMessage { id content sender { id username } createdAt }
        }
    }
`;

export const STORIES_QUERY = /* GraphQL */ `
    query Stories {
        stories {
            id imageUrl text duration expiresAt isViewed viewsCount
            author { id username avatarUrl }
        }
    }
`;

export const EXPLORE_QUERY = /* GraphQL */ `
    query Explore {
        explore {
            trending { hashtag postsCount trend }
            suggestedUsers { id username displayName avatarUrl followersCount isFollowing }
            featuredPosts { id content imageUrls likesCount author { id username avatarUrl } }
        }
    }
`;

// ── Mutation strings ──────────────────────────────────────────────────────────

export const CREATE_POST_MUTATION = /* GraphQL */ `
    mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
            post { id content createdAt author { id username avatarUrl } }
            errors
        }
    }
`;

export const LIKE_POST_MUTATION = /* GraphQL */ `
    mutation LikePost($id: ID!) {
        likePost(id: $id) { id likesCount isLiked }
    }
`;

export const UNLIKE_POST_MUTATION = /* GraphQL */ `
    mutation UnlikePost($id: ID!) {
        unlikePost(id: $id) { id likesCount isLiked }
    }
`;

export const FOLLOW_USER_MUTATION = /* GraphQL */ `
    mutation FollowUser($id: ID!) {
        followUser(id: $id) { id followersCount isFollowing }
    }
`;

export const UNFOLLOW_USER_MUTATION = /* GraphQL */ `
    mutation UnfollowUser($id: ID!) {
        unfollowUser(id: $id) { id followersCount isFollowing }
    }
`;
