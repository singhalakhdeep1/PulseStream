import { create } from "zustand";

interface UIState {
    composeOpen: boolean;
    activeStory: string | null;
    sidebarOpen: boolean;
    setComposeOpen: (v: boolean) => void;
    setActiveStory: (id: string | null) => void;
    setSidebarOpen: (v: boolean) => void;
    toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    composeOpen: false,
    activeStory: null,
    sidebarOpen: false,
    setComposeOpen: (v) => set({ composeOpen: v }),
    setActiveStory: (id) => set({ activeStory: id }),
    setSidebarOpen: (v) => set({ sidebarOpen: v }),
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
