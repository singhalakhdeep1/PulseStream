"use client";
import * as React from "react";
import { TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader } from "@feedflow/ui";

// Right sidebar is shell-owned — shows trending topics and user suggestions
// In production these would be fetched via the GraphQL BFF

export function RightSidebar() {
    return (
        <div className="space-y-4 w-full">
            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <TrendingUp className="h-4 w-4" />
                        Trending
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">Loading trends…</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <Users className="h-4 w-4" />
                        Suggested for you
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">Loading suggestions…</p>
                </CardContent>
            </Card>
        </div>
    );
}
