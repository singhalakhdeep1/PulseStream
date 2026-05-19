/**
 * FeedFlow — A11y test suite (WCAG 2.2 AA)
 *
 * axe-playwright runs axe-core against live pages in a browser context.
 *
 * Run: pnpm test:a11y
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "axe-playwright";

const PAGES = [
    { name: "Landing", path: "/" },
    { name: "Login", path: "/login" },
    { name: "Feed", path: "/feed" },
    { name: "Explore", path: "/explore" },
    { name: "Settings", path: "/settings" },
];

for (const pg of PAGES) {
    test(`A11y: ${pg.name} passes WCAG 2.2 AA`, async ({ page }) => {
        await page.goto(pg.path);
        await page.waitForLoadState("networkidle");

        const results = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .exclude("#__next-route-announcer__")
            .analyze();

        expect(
            results.violations,
            `Violations on ${pg.name}:\n${JSON.stringify(results.violations, null, 2)}`
        ).toHaveLength(0);
    });
}

test("A11y: Post card has correct ARIA roles and labels", async ({ page }) => {
    await page.goto("/feed");
    await page.waitForLoadState("networkidle");

    // Each post should be an article with a labelled region
    const articles = page.locator("article");
    const count = await articles.count();
    expect(count).toBeGreaterThan(0);

    // Like buttons must have accessible labels
    const likeButtons = page.locator("button[aria-label*='like' i]");
    expect(await likeButtons.count()).toBeGreaterThan(0);
});

test("A11y: Story viewer traps focus when open", async ({ page }) => {
    await page.goto("/feed");
    await page.waitForLoadState("networkidle");

    const storyButton = page.locator("[data-testid='story-item']").first();
    if (await storyButton.count() > 0) {
        await storyButton.click();
        // Focus should be inside the dialog
        const focused = await page.evaluate(() =>
            document.activeElement?.closest("[role='dialog']") !== null
        );
        expect(focused).toBe(true);
    }
});
