import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

/**
 * Content Security Policy — OWASP A05:2021
 * Prevents XSS, clickjacking, and data injection on user-generated content.
 */
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.posthog.com https://*.sentry.io;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://*.supabase.co https://imagedelivery.net https://ui-avatars.com https://avatars.githubusercontent.com https://lh3.googleusercontent.com;
  font-src 'self';
  media-src 'self' blob: https://*.supabase.co https://imagedelivery.net;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.posthog.com https://*.sentry.io https://api.stripe.com https://*.upstash.io;
  worker-src 'self' blob:;
`.replace(/\n/g, " ").trim();

const securityHeaders = [
    { key: "Content-Security-Policy", value: ContentSecurityPolicy },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-XSS-Protection", value: "1; mode=block" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "**.supabase.co" },
            { protocol: "https", hostname: "imagedelivery.net" },
            { protocol: "https", hostname: "ui-avatars.com" },
            { protocol: "https", hostname: "avatars.githubusercontent.com" },
            { protocol: "https", hostname: "lh3.googleusercontent.com" },
        ],
        formats: ["image/avif", "image/webp"],
    },
    async headers() {
        return [{ source: "/(.*)", headers: securityHeaders }];
    },
    experimental: {
        optimizePackageImports: ["lucide-react", "recharts", "@radix-ui/react-icons"],
    },
};

export default withSentryConfig(nextConfig, {
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    widenClientFileUpload: true,
    sourcemaps: { disable: true },
    disableLogger: true,
});
