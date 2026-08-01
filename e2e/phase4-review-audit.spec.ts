import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const TEST_CITY_ID = "5d58ec61-0d7d-4524-a102-93579dda3b99"; // "Test City Draft" seed
const ADMIN_EMAIL = "test-admin@hiyaza.local";
const ADMIN_PASSWORD = "TestAdmin!2026Dev";

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("البريد الإلكتروني").fill(ADMIN_EMAIL);
  await page.getByLabel("كلمة المرور").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await expect(page).not.toHaveURL(/\/login$/, { timeout: 15_000 });
}

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

test.describe("Phase 4 — Review queue & audit trail (live project)", () => {
  let addedHoldingId: string;
  let fieldUserId: string;
  const service = createServiceClient();

  test.beforeAll(async () => {
    const { data: fieldUser } = await service
      .from("profiles")
      .select("id")
      .eq("email", "test-field@hiyaza.local")
      .single();
    fieldUserId = fieldUser!.id;
  });

  test.beforeEach(async () => {
    const { data, error } = await service
      .from("added_holdings")
      .insert({
        city_id: TEST_CITY_ID,
        client_id: crypto.randomUUID(),
        holder_name: "شخص جديد للاختبار",
        national_id: "22222222222222",
        basin_name: "حوض الاختبار",
        created_by: fieldUserId,
      })
      .select()
      .single();
    if (error) throw error;
    addedHoldingId = data.id;
  });

  test.afterEach(async () => {
    const { data: added } = await service
      .from("added_holdings")
      .select("promoted_holding_id")
      .eq("id", addedHoldingId)
      .single();
    if (added?.promoted_holding_id) {
      await service.from("holdings").delete().eq("id", added.promoted_holding_id);
    }
    await service.from("added_holdings").delete().eq("id", addedHoldingId);
  });

  test("approving a field-added record promotes it into holdings and the audit trail shows the review", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto("/review");
    await expect(page.getByText("شخص جديد للاختبار")).toBeVisible({ timeout: 15_000 });

    await page.getByRole("row", { name: /شخص جديد للاختبار/ }).getByRole("button", { name: "موافقة" }).click();
    await page.getByRole("button", { name: "موافقة وترقية" }).click();
    await expect(page.getByText("تمت الموافقة وترقية السجل إلى الحيازات")).toBeVisible({
      timeout: 15_000,
    });

    // Verify the promotion actually happened server-side.
    await expect(async () => {
      const { data } = await service
        .from("added_holdings")
        .select("status, promoted_holding_id, reviewed_by, reviewed_at")
        .eq("id", addedHoldingId)
        .single();
      expect(data!.status).toBe("approved");
      expect(data!.promoted_holding_id).toBeTruthy();
      expect(data!.reviewed_by).toBeTruthy();
      expect(data!.reviewed_at).toBeTruthy();

      const { data: holding } = await service
        .from("holdings")
        .select("holder_name")
        .eq("id", data!.promoted_holding_id)
        .single();
      expect(holding!.holder_name).toBe("شخص جديد للاختبار");
    }).toPass({ timeout: 10_000 });

    // The audit trail shows the review action.
    await page.goto("/audit");
    await expect(page.getByText(/شخص جديد للاختبار/).first()).toBeVisible({ timeout: 15_000 });
  });
});
