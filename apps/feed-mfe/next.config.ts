import type { NextConfig } from "next";
const { NextFederationPlugin } = require("@module-federation/nextjs-mf");

const nextConfig: NextConfig = {
    webpack(config, options) {
        config.plugins.push(
            new NextFederationPlugin({
                name: "feed_mfe",
                // This MFE is a REMOTE — it exposes components to the shell
                exposes: {
                    "./FeedPage":        "./components/feed-page",
                    "./CreatePostModal": "./components/create-post-modal",
                    "./FeedWidget":      "./components/feed-widget",
                },
                shared: {
                    react:                   { singleton: true, requiredVersion: "^19.0.0", eager: true },
                    "react-dom":             { singleton: true, requiredVersion: "^19.0.0", eager: true },
                    "@feedflow/types":        { singleton: true, requiredVersion: "*" },
                    "@feedflow/ui":           { singleton: true, requiredVersion: "*" },
                    "@feedflow/auth":         { singleton: true, requiredVersion: "*" },
                    "@tanstack/react-query":  { singleton: true, requiredVersion: "^5.75.5", eager: true },
                },
                filename: "static/chunks/remoteEntry.js",
            })
        );
        return config;
    },
    images: {
        remotePatterns: [{ hostname: "*.supabase.co" }],
    },
};

export default nextConfig;
