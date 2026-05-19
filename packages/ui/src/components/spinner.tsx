"use client";
import * as React from "react";
import { cn } from "../utils";

export function Spinner({ className }: { className?: string }) {
    return (
        <div
            className={cn("animate-spin rounded-full border-2 border-muted border-t-primary h-5 w-5", className)}
            role="status"
            aria-label="Loading"
        />
    );
}
