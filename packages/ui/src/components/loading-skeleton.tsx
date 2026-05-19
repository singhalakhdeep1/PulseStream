"use client";
import * as React from "react";
import { cn } from "../utils";

export function LoadingSkeleton({ className }: { className?: string }) {
    return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}
