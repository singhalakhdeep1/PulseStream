"use client";
import * as React from "react";
import { ToastProvider, ToastViewport, Toast, useToast } from "@feedflow/ui";

export function ToastShell() {
    const { toasts } = useToast();
    return (
        <ToastProvider>
            {toasts.map(({ id, title, description }) => (
                <Toast key={id}>
                    <div>
                        <p className="text-sm font-semibold">{title}</p>
                        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
                    </div>
                </Toast>
            ))}
            <ToastViewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-2 w-[390px] z-[100] max-h-screen" />
        </ToastProvider>
    );
}
