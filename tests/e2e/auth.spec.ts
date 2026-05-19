import { test, expect } from "@playwright/test";

test.describe("Auth flows", () => {
    test("login page renders", async ({ page }) => {
        await page.goto("/login");
        await expect(page.getByText("Welcome back")).toBeVisible();
        await expect(page.getByLabel("Email")).toBeVisible();
        await expect(page.getByLabel("Password")).toBeVisible();
    });

    test("shows validation errors on empty submit", async ({ page }) => {
        await page.goto("/login");
        await page.getByRole("button", { name: "Sign In" }).click();
        await expect(page.getByText(/invalid email/i)).toBeVisible();
    });

    test("register page renders", async ({ page }) => {
        await page.goto("/register");
        await expect(page.getByText("Create account")).toBeVisible();
        await expect(page.getByLabel("Username")).toBeVisible();
        await expect(page.getByLabel("Email")).toBeVisible();
    });

    test("forgot password page renders", async ({ page }) => {
        await page.goto("/forgot-password");
        await expect(page.getByText("Reset password")).toBeVisible();
        await expect(page.getByLabel("Email")).toBeVisible();
        await expect(page.getByRole("button", { name: "Send Reset Link" })).toBeVisible();
    });

    test("navigate from login to register", async ({ page }) => {
        await page.goto("/login");
        await page.getByRole("link", { name: "Sign up" }).click();
        await expect(page).toHaveURL("/register");
    });
});
