import type { NextConfig } from "next";
const { NextFederationPlugin } = require("@module-federation/nextjs-mf");

const nextConfig: NextConfig = {
    webpack(config, options) {
        config.plugins.push(
            new NextFederationPlugin({
                name: "profile_mfe",
                exposes: {
                    "./ProfilePage":      "./components/profile-page",
                    "./ProfileCard":      "./components/profile-card",
                    "./EditProfileModal": "./components/edit-profile-modal",
                },
                shared: {
                    react:                  { singleton: true, requiredVersion: "^19.0.0", eager: true },
                    "react-dom":            { singleton: true, requiredVersion: "^19.0.0", eager: true },
                    "@feedflow/types":       { singleton: true, requiredVersion: "*" },
                    "@feedflow/ui":          { singleton: true, requiredVersion: "*" },
                    "@feedflow/auth":        { singleton: true, requiredVersion: "*" },
                    "@tanstack/react-query": { singleton: true, requiredVersion: "^5.75.5", eager: true },
                },
                filename: "static/chunks/remoteEntry.js",
            })
        );
        return config;
    },
};

export default nextConfig;
