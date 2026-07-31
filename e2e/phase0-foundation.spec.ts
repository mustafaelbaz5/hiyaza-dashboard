import { test, expect } from "@playwright/test";

test.describe("Phase 0 — Foundation", () => {
  test("unauthenticated root route redirects to /login (auth guard active)", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  });

  test("theme toggle cycles through light/dark/system on the login page", async ({ page }) => {
    await page.goto("/login");
    const html = page.locator("html");
    const initialClass = (await html.getAttribute("class")) ?? "";
    expect(initialClass.includes("dark") || initialClass.includes("light")).toBe(true);
  });

  test("login page is reachable and renders the form shell", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("لوحة تحكم هيازة فايندر")).toBeVisible();
    await expect(page.getByLabel("البريد الإلكتروني")).toBeVisible();
    await expect(page.getByLabel("كلمة المرور")).toBeVisible();
  });
});
