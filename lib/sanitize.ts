/**
 * Sanitize untrusted HTML using DOMPurify — OWASP A03:2021 XSS prevention.
 *
 * Must only be called client-side (DOMPurify requires a DOM).
 * For SSR contexts, strip HTML tags entirely with `stripHtml`.
 */

import DOMPurify from "dompurify";

/** Allowed tags for rich user content (posts, comments, AI responses). */
const POST_CONFIG: DOMPurify.Config = {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "br", "p", "span", "code", "pre"],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
    ADD_ATTR: ["target"],       // allow target="_blank" on links
    FORCE_BODY: true,
};

/** Strip all HTML — safe for plain text contexts (tooltips, meta descriptions). */
const PLAIN_CONFIG: DOMPurify.Config = {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
};

/**
 * Sanitize user-generated HTML for rendering with dangerouslySetInnerHTML.
 * Ensures all links have rel="noopener noreferrer" to prevent tab-napping.
 */
export function sanitizeHtml(dirty: string): string {
    if (typeof window === "undefined") return stripHtml(dirty);
    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
        if (node.tagName === "A") {
            node.setAttribute("target", "_blank");
            node.setAttribute("rel", "noopener noreferrer");
        }
    });
    const clean = DOMPurify.sanitize(dirty, POST_CONFIG) as string;
    DOMPurify.removeHook("afterSanitizeAttributes");
    return clean;
}

/**
 * Strip all HTML tags — returns plain text.
 * Safe for SSR; no DOM required.
 */
export function stripHtml(dirty: string): string {
    if (typeof window === "undefined") {
        return dirty.replace(/<[^>]*>/g, "");
    }
    return DOMPurify.sanitize(dirty, PLAIN_CONFIG) as string;
}
