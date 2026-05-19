"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";

const makeClient = () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } });

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [client] = React.useState(makeClient);
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
