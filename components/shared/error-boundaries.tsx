"use client";

/**
 * FeedFlow — Error boundaries for crash-prone sub-trees.
 *
 * Feed and media components crash on bad API payloads.
 * Wrapping them allows the rest of the app to stay functional.
 *
 * Skill coverage: react-error-boundary v5, production resilience patterns
 */

import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { AlertTriangle, RefreshCw, ImageOff, MessageCircleOff } from "lucide-react";
import { Button } from "@/components/ui/button";

function ErrorFallback({ error, resetErrorBoundary, icon: Icon, label }: FallbackProps & {
    icon: React.ElementType;
    label: string;
}) {
    return (
        <div
            role="alert"
            className="flex flex-col items-center justify-center gap-2 p-6 text-center rounded-xl border border-destructive/20 bg-destructive/5"
        >
            <Icon className="h-7 w-7 text-destructive/50" />
            <p className="text-sm font-medium text-destructive">{label} unavailable</p>
            <p className="text-xs text-muted-foreground max-w-xs">
                {error?.message ?? "Something went wrong. This has been reported."}
            </p>
            <Button size="sm" variant="ghost" onClick={resetErrorBoundary} className="gap-1.5 mt-1">
                <RefreshCw className="h-3 w-3" />
                Try again
            </Button>
        </div>
    );
}

// ── Feed list error boundary ──────────────────────────────────────────────────

export function FeedErrorBoundary({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary
            fallbackRender={(props) => (
                <ErrorFallback {...props} icon={AlertTriangle} label="Feed" />
            )}
            onError={(error) => console.error("[FeedErrorBoundary]", error)}
        >
            {children}
        </ErrorBoundary>
    );
}

// ── Media / image error boundary ─────────────────────────────────────────────

export function MediaErrorBoundary({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary
            fallbackRender={(props) => (
                <ErrorFallback {...props} icon={ImageOff} label="Media" />
            )}
            onError={(error) => console.error("[MediaErrorBoundary]", error)}
        >
            {children}
        </ErrorBoundary>
    );
}

// ── Messages / chat error boundary ───────────────────────────────────────────

export function ChatErrorBoundary({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary
            fallbackRender={(props) => (
                <ErrorFallback {...props} icon={MessageCircleOff} label="Chat" />
            )}
            onError={(error) => console.error("[ChatErrorBoundary]", error)}
        >
            {children}
        </ErrorBoundary>
    );
}
