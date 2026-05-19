"use client";
import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cn } from "../utils";

export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = ToastPrimitive.Viewport;

export const Toast = React.forwardRef<
    React.ElementRef<typeof ToastPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>
>(({ className, ...props }, ref) => (
    <ToastPrimitive.Root
        ref={ref}
        className={cn(
            "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full bg-background text-foreground border-border",
            className
        )}
        {...props}
    />
));
Toast.displayName = ToastPrimitive.Root.displayName;

// Minimal useToast hook
type ToastItem = { id: string; title: string; description?: string; variant?: "default" | "destructive" };

const listeners: Array<(toasts: ToastItem[]) => void> = [];
let _toasts: ToastItem[] = [];

export function useToast() {
    const [toasts, setToasts] = React.useState<ToastItem[]>(_toasts);

    React.useEffect(() => {
        listeners.push(setToasts);
        return () => { listeners.splice(listeners.indexOf(setToasts), 1); };
    }, []);

    const toast = React.useCallback((item: Omit<ToastItem, "id">) => {
        const id = Math.random().toString(36).slice(2);
        _toasts = [..._toasts, { ...item, id }];
        listeners.forEach((l) => l(_toasts));
        setTimeout(() => {
            _toasts = _toasts.filter((t) => t.id !== id);
            listeners.forEach((l) => l(_toasts));
        }, 5000);
    }, []);

    return { toast, toasts };
}
