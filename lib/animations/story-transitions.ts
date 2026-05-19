"use client";

/**
 * FeedFlow — GSAP story viewer transitions + View Transitions API
 *
 * Used in the StoryViewer component to animate between stories.
 * Also provides useViewTransitionRouter for Next.js link navigation.
 *
 * Skill coverage: GSAP, View Transitions API
 */

import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

// ─── Story slide transitions ──────────────────────────────────────────────────

/**
 * Animate from one story to the next (slide left).
 * @param container - The story viewport element
 * @param direction - "next" or "prev"
 */
export function animateStoryTransition(
    container: HTMLElement,
    direction: "next" | "prev"
): Promise<void> {
    const xOut = direction === "next" ? -100 : 100;
    const xIn = direction === "next" ? 100 : -100;

    return new Promise((resolve) => {
        const tl = gsap.timeline({ onComplete: resolve });

        // Exit current story
        tl.to(container, {
            x: `${xOut}%`,
            opacity: 0,
            duration: 0.22,
            ease: "power2.in",
        });

        // Reset and enter next story
        tl.set(container, { x: `${xIn}%`, opacity: 0 });
        tl.to(container, {
            x: "0%",
            opacity: 1,
            duration: 0.28,
            ease: "power2.out",
        });
    });
}

/**
 * Progress bar fill animation for story auto-advance timer.
 * Returns a GSAP tween so callers can pause/resume/kill it.
 */
export function createStoryProgressTween(
    progressEl: HTMLElement,
    durationSeconds: number,
    onComplete: () => void
): gsap.core.Tween {
    return gsap.fromTo(
        progressEl,
        { scaleX: 0 },
        {
            scaleX: 1,
            duration: durationSeconds,
            ease: "none",
            transformOrigin: "left center",
            onComplete,
        }
    );
}

/**
 * Animate the story viewer opening (scale + fade in from thumbnail).
 */
export function animateStoryOpen(viewer: HTMLElement): void {
    gsap.fromTo(
        viewer,
        { scale: 0.85, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.35, ease: "back.out(1.4)" }
    );
}

/**
 * Animate the story viewer closing.
 */
export function animateStoryClose(viewer: HTMLElement, onComplete: () => void): void {
    gsap.to(viewer, {
        scale: 0.85,
        opacity: 0,
        y: 20,
        duration: 0.22,
        ease: "power2.in",
        onComplete,
    });
}

// ─── View Transitions API router hook ─────────────────────────────────────────

export function useViewTransitionRouter() {
    const router = useRouter();

    const push = useCallback(
        (href: string) => {
            if (!("startViewTransition" in document)) {
                router.push(href);
                return;
            }
            (document as any).startViewTransition(() => router.push(href));
        },
        [router]
    );

    return { push };
}

// ─── Feed post entry animation ────────────────────────────────────────────────

/**
 * Stagger-animate new posts as they're prepended to the feed.
 * Call after inserting new DOM nodes.
 */
export function animateNewPosts(selector = "[data-new-post]"): void {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;

    gsap.fromTo(
        els,
        { y: -16, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 0.35,
            stagger: 0.05,
            ease: "power2.out",
            clearProps: "transform,opacity",
        }
    );
}
