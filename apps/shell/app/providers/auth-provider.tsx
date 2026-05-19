"use client";
import * as React from "react";
import { useCurrentUser } from "@feedflow/auth/client";
import type { AuthUser } from "@feedflow/types";

interface AuthCtx {
    user: AuthUser | null;
    loading: boolean;
}

const AuthContext = React.createContext<AuthCtx>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { user, loading } = useCurrentUser();
    return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return React.useContext(AuthContext);
}
