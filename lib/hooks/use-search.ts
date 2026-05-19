"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

interface SearchResult {
    id: string;
    type: "post" | "user";
    text?: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
}

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

async function searchAll(query: string): Promise<SearchResult[]> {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
}

export function useSearch(initialQuery = "") {
    const [query, setQuery] = useState(initialQuery);
    const debouncedQuery = useDebounce(query, 300);

    const { data: results, isLoading, isFetching } = useQuery({
        queryKey: ["search", debouncedQuery],
        queryFn: () => searchAll(debouncedQuery),
        enabled: debouncedQuery.trim().length >= 2,
        staleTime: 30_000,
    });

    return {
        query,
        setQuery,
        results: results ?? [],
        isLoading: isLoading || isFetching,
    };
}
