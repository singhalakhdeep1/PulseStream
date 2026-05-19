import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import { WebVitalsReporter } from "@/components/providers/web-vitals-reporter";
import "./globals.css";
import { Providers } from "@/components/providers/providers";

export const metadata: Metadata = {
    title: { default: "FeedFlow", template: "%s · FeedFlow" },
    description: "Real-time social feed platform — share moments, connect instantly.",
    manifest: "/manifest.json",
    appleWebApp: { capable: true, statusBarStyle: "default", title: "FeedFlow" },
    openGraph: {
        type: "website",
        title: "FeedFlow",
        description: "Real-time social feed platform",
        siteName: "FeedFlow",
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
                <Providers>{children}</Providers>
                <WebVitalsReporter />
                <Toaster richColors position="bottom-right" closeButton />
            </body>
        </html>
    );
}
