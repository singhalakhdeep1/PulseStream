"use client";

import * as React from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

type ToasterToast = ToastProps & {
    id: string;
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: ToastActionElement;
};

type State = { toasts: ToasterToast[] };

let count = 0;
const genId = () => String(++count);

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: { type: "ADD" | "REMOVE" | "UPDATE"; toast?: ToasterToast; toastId?: string }) {
    if (action.type === "ADD") {
        memoryState = {
            toasts: [action.toast!, ...memoryState.toasts].slice(0, TOAST_LIMIT),
        };
    } else if (action.type === "REMOVE") {
        memoryState = {
            toasts: memoryState.toasts.filter((t) => t.id !== action.toastId),
        };
    }
    listeners.forEach((l) => l(memoryState));
}

function toast({ ...props }: Omit<ToasterToast, "id">) {
    const id = genId();
    const update = (p: ToasterToast) => dispatch({ type: "UPDATE", toast: { ...p, id } });
    const dismiss = () => dispatch({ type: "REMOVE", toastId: id });

    dispatch({ type: "ADD", toast: { ...props, id, open: true, onOpenChange: (o) => { if (!o) dismiss(); } } });

    const timeout = setTimeout(dismiss, TOAST_REMOVE_DELAY);
    toastTimeouts.set(id, timeout);

    return { id, dismiss, update };
}

function useToast() {
    const [state, setState] = React.useState<State>(memoryState);
    React.useEffect(() => {
        listeners.push(setState);
        return () => { listeners.splice(listeners.indexOf(setState), 1); };
    }, []);
    return { ...state, toast, dismiss: (id?: string) => dispatch({ type: "REMOVE", toastId: id }) };
}

export { useToast, toast };
