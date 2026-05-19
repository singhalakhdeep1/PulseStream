import type { NextConfig } from "next";
const { NextFederationPlugin } = require("@module-federation/nextjs-mf");

// ── Remote MFE URLs (env-overridable for staging/prod) ───────────────────────
const REMOTES = {
    feed_mfe: process.env.FEED_MFE_URL ?? "http://localhost:3001",
    messages_mfe: process.env.MESSAGES_MFE_URL ?? "http://localhost:3002",
    notifications_mfe: process.env.NOTIFICATIONS_MFE_URL ?? "http://localhost:3003",
    profile_mfe: process.env.PROFILE_MFE_URL ?? "http://localhost:3004",
};

const nextConfig: NextConfig = {
    // Webpack required — Turbopack does not support Module Federation yet
    webpack(config, options) {
        config.plugins.push(
            new NextFederationPlugin({
                name: "shell",
                remotes: {
                    feed_mfe: `feed_mfe@${REMOTES.feed_mfe}/_next/static/chunks/remoteEntry.js`,
                    messages_mfe: `messages_mfe@${REMOTES.messages_mfe}/_next/static/chunks/remoteEntry.js`,
                    notifications_mfe: `notifications_mfe@${REMOTES.notifications_mfe}/_next/static/chunks/remoteEntry.js`,
                    profile_mfe: `profile_mfe@${REMOTES.profile_mfe}/_next/static/chunks/remoteEntry.js`,
                },
                // Shared singletons — only ONE copy loads across shell + all MFEs
                shared: {
                    react: { singleton: true, requiredVersion: "^19.0.0", eager: true },
                    "react-dom": { singleton: true, requiredVersion: "^19.0.0", eager: true },
                    "@feedflow/types": { singleton: true, requiredVersion: "*" },
                    "@feedflow/ui": { singleton: true, requiredVersion: "*" },
                    "@feedflow/auth": { singleton: true, requiredVersion: "*" },
                    "@tanstack/react-query": { singleton: true, requiredVersion: "^5.75.5", eager: true },
                    "zustand": { singleton: true, requiredVersion: "^5.0.4" },
                    "jotai": { singleton: true, requiredVersion: "^2.10.3" },
                    "next-themes": { singleton: true, requiredVersion: "^0.4.6" },
                },
                filename: "static/chunks/remoteEntry.js",
                exposes: {},
                extraOptions: {
                    automaticAsyncBoundary: true,
                    skipSharingNextInternals: false,
                },
            })
        );
        return config;
    },
    experimental: {
        // Required for Module Federation + Next.js App Router
        appDir: true,
    },
    images: {
        remotePatterns: [
            { hostname: "*.supabase.co" },
            { hostname: "avatars.githubusercontent.com" },
        ],
    },
};

export default nextConfig;
