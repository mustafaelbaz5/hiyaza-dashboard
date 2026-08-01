import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ADMIN_EMAIL = "test-admin@hiyaza.local";
const ADMIN_PASSWORD = "TestAdmin!2026Dev";
const TEST_CITY_ID = "5d58ec61-0d7d-4524-a102-93579dda3b99";

const ROUTES = [
  "/",
  "/cities",
  `/cities/${TEST_CITY_ID}`,
  `/cities/${TEST_CITY_ID}/holdings`,
  `/cities/${TEST_CITY_ID}/import`,
  `/cities/${TEST_CITY_ID}/quality`,
  "/review",
  "/audit",
  "/analytics",
  "/users",
];

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(ADMIN_EMAIL);
  await page.getByLabel("كلمة المرور").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await expect(page).not.toHaveURL(/\/login$/, { timeout: 15_000 });
}

for (const theme of ["light", "dark"] as const) {
  test.describe(`Accessibility — ${theme} theme`, () => {
    test.use({ colorScheme: theme });

    for (const route of ROUTES) {
      test(`${route} has no serious/critical axe violations`, async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto(route);
        await page.waitForLoadState("networkidle");

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa"])
          .analyze();

        const serious = results.violations.filter(
          (v) => v.impact === "serious" || v.impact === "critical",
        );
        expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
      });
    }
  });
}
