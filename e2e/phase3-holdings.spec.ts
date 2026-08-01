import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const TEST_CITY_ID = "5d58ec61-0d7d-4524-a102-93579dda3b99"; // "Test City Draft" seed
const ADMIN_EMAIL = "test-admin@hiyaza.local";
const ADMIN_PASSWORD = "TestAdmin!2026Dev";
const TEST_UNIFIED_NUMBER = "E2E-PHASE3-HOLDING";

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(ADMIN_EMAIL);
  await page.getByLabel("كلمة المرور").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await expect(page).not.toHaveURL(/\/login$/, { timeout: 15_000 });
}

/**
 * Uses the service-role key for seeding/verification only (never for the UI interaction) —
 * signing in twice as the same user via two separate clients (this script + the browser)
 * invalidates the earlier session under Supabase's refresh-token rotation, so a second anon
 * session isn't a reliable way to verify state here. This test isn't exercising RLS, it's
 * confirming the write landed correctly.
 */
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

test.describe("Phase 3 — Holdings data explorer (live project)", () => {
  let holdingId: string;
  const service = createServiceClient();

  test.beforeEach(async () => {
    const { data, error } = await service
      .from("holdings")
      .insert({
        city_id: TEST_CITY_ID,
        holding_id_number: "E2E-3",
        unified_number: TEST_UNIFIED_NUMBER,
        holder_name: "اختبار الحيازات",
        national_id: "11111111111111",
        basin_name: "حوض الاختبار",
        feddan: 1,
        qirat: 5,
        sahm: 0,
        total_sqm: 100,
      })
      .select()
      .single();
    if (error) throw error;
    holdingId = data.id;
  });

  test.afterEach(async () => {
    await service.from("holding_edits").delete().eq("holding_id", holdingId);
    await service.from("holdings").delete().eq("id", holdingId);
  });

  test("inline edit creates a holding_edits row without mutating holdings, and the merged value renders", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto(`/cities/${TEST_CITY_ID}/holdings`);
    await expect(page.getByText("اختبار الحيازات")).toBeVisible({ timeout: 15_000 });

    // Click into the holder_name cell and change it.
    await page.getByText("اختبار الحيازات").first().click();
    const editInput = page.locator("input:focus");
    await editInput.fill("اختبار الحيازات المعدل");
    await editInput.press("Enter");

    // The merged (edited) value renders in the table.
    await expect(page.getByText("اختبار الحيازات المعدل")).toBeVisible({ timeout: 15_000 });

    // The underlying `holdings` row was never mutated.
    const { data: afterHolding } = await service
      .from("holdings")
      .select("*")
      .eq("id", holdingId)
      .single();
    expect(afterHolding!.holder_name).toBe("اختبار الحيازات");

    // A holding_edits row was created with the new value in its payload. The UI already
    // rendered the merged value above (so the write has committed), but a fresh verification
    // connection can briefly lag behind under connection pooling — poll briefly rather than flake.
    await expect(async () => {
      const { data: edits } = await service
        .from("holding_edits")
        .select("*")
        .eq("holding_id", holdingId)
        .order("edited_at", { ascending: false })
        .limit(1);
      expect(edits).toHaveLength(1);
      expect((edits![0].payload as Record<string, unknown>).holder_name).toBe("اختبار الحيازات المعدل");
    }).toPass({ timeout: 10_000 });
  });
});
