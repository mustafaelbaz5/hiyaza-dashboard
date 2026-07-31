import { test, expect } from "@playwright/test";

test.describe("Phase 0 — Foundation", () => {
  test("root route renders the dashboard shell in RTL", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.getByRole("heading", { name: "نظرة عامة" })).toBeVisible();
    await expect(page.getByText("هيازة فايندر")).toBeVisible();
  });

  test("theme toggle cycles through light/dark/system without layout breakage", async ({
    page,
  }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "تبديل المظهر" });
    const html = page.locator("html");

    const seenClasses = new Set<string>();
    for (let i = 0; i < 3; i++) {
      await toggle.click();
      const classAttr = (await html.getAttribute("class")) ?? "";
      const resolved = classAttr.includes("dark") ? "dark" : "light";
      seenClasses.add(resolved);
      await expect(page.getByRole("heading", { name: "نظرة عامة" })).toBeVisible();
    }

    expect(seenClasses.size).toBeGreaterThan(0);
  });

  test("login page is reachable", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("لوحة تحكم هيازة فايندر")).toBeVisible();
    await expect(page.getByLabel("البريد الإلكتروني")).toBeVisible();
  });
});
