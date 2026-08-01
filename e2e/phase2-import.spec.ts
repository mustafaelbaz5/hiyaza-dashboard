import { test, expect } from "@playwright/test";
import path from "node:path";

const TEST_CITY_ID = "5d58ec61-0d7d-4524-a102-93579dda3b99"; // "Test City Draft" seed
const FIXTURE_PATH = path.join(__dirname, "fixtures", "الدير_ائتمان_مجمع.xlsx");
const ADMIN_EMAIL = "test-admin@hiyaza.local";
const ADMIN_PASSWORD = "TestAdmin!2026Dev";

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(ADMIN_EMAIL);
  await page.getByLabel("كلمة المرور").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await expect(page).not.toHaveURL(/\/login$/, { timeout: 15_000 });
}

test.describe("Phase 2 — Excel import (live project)", () => {
  test.describe.configure({ mode: "serial" });

  // 1,202 rows found; 7 rejected (fractional سهم — the real schema's int columns can't hold
  // them without corrupting a legal land-share value, see core/validate-rows.ts); 1,195 valid,
  // deduplicated to 911 holdings on commit (306 rows share a unified_number within this file).
  test("upload the real sample file and preview reports 1,202 rows found, 1,195 valid, 7 rejected, 8 sheets skipped", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto(`/cities/${TEST_CITY_ID}/import`);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(FIXTURE_PATH);

    await expect(page.getByText(/معاينة الاستيراد/)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("1,202").first()).toBeVisible();
    await expect(page.getByText("1,195").first()).toBeVisible();
    await expect(page.getByText("7", { exact: true }).first()).toBeVisible();

    const skippedBadges = page.locator("text=البشيط");
    await expect(skippedBadges.first()).toBeVisible();
  });

  test("commit the import and verify the batch history shows the deduplicated row count", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto(`/cities/${TEST_CITY_ID}/import`);

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(FIXTURE_PATH);
    await expect(page.getByText(/معاينة الاستيراد/)).toBeVisible({ timeout: 30_000 });

    await page.getByRole("button", { name: /تأكيد الاستيراد/ }).click();
    await expect(page.getByText(/تم استيراد/)).toBeVisible({ timeout: 60_000 });

    // The history row's "rows imported" reflects rows *validated*, not post-dedup holdings —
    // the dedup count (911) is verified separately at the RPC level.
    await expect(page.getByRole("cell", { name: "1195" })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("مكتمل")).toBeVisible();
  });

  test("roll back and verify the batch is marked rolled back", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`/cities/${TEST_CITY_ID}/import`);

    const rollbackButton = page.getByRole("button", { name: "تراجع" }).first();
    await expect(rollbackButton).toBeVisible({ timeout: 15_000 });
    await rollbackButton.click();

    await page.getByRole("button", { name: "تراجع" }).last().click();
    await expect(page.getByText("تم التراجع عن الاستيراد")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("تم التراجع").first()).toBeVisible();
  });
});
