"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Profile } from "@/types";

interface AppState {
    currentUser: Profile | null;
    setCurrentUser: (user: Profile | null) => void;

    // Like optimistic state (debounced batch)
    pendingLikes: Set<string>;
    pendingUnlikes: Set<string>;
    addPendingLike: (postId: string) => void;
    addPendingUnlike: (postId: string) => void;
    clearPendingLike: (postId: string) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            currentUser: null,
            setCurrentUser: (user) => set({ currentUser: user }),

            pendingLikes: new Set(),
            pendingUnlikes: new Set(),
            addPendingLike: (postId) =>
                set((s) => ({
                    pendingLikes: new Set([...s.pendingLikes, postId]),
                    pendingUnlikes: new Set([...s.pendingUnlikes].filter((id) => id !== postId)),
                })),
            addPendingUnlike: (postId) =>
                set((s) => ({
                    pendingUnlikes: new Set([...s.pendingUnlikes, postId]),
                    pendingLikes: new Set([...s.pendingLikes].filter((id) => id !== postId)),
                })),
            clearPendingLike: (postId) =>
                set((s) => ({
                    pendingLikes: new Set([...s.pendingLikes].filter((id) => id !== postId)),
                    pendingUnlikes: new Set([...s.pendingUnlikes].filter((id) => id !== postId)),
                })),
        }),
        {
            name: "feedflow-app",
            partialize: (state) => ({ currentUser: state.currentUser }),
        }
    )
);
