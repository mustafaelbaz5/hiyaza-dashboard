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

test.describe("Phase 4 — Field-added records auto-promote & audit trail (live project)", () => {
  let fieldUserId: string;
  let fieldUserName: string;
  const service = createServiceClient();

  test.beforeAll(async () => {
    const { data: fieldUser } = await service
      .from("profiles")
      .select("id, display_name")
      .eq("email", "test-field@hiyaza.local")
      .single();
    fieldUserId = fieldUser!.id;
    fieldUserName = fieldUser!.display_name!;
  });

  test("a field-added record auto-promotes into holdings immediately, with full attribution in review + audit", async ({
    page,
  }) => {
    const { data: added } = await service
      .from("added_holdings")
      .insert({
        city_id: TEST_CITY_ID,
        client_id: crypto.randomUUID(),
        holder_name: "شخص جديد للاختبار التلقائي",
        national_id: "22222222222222",
        basin_name: "حوض الاختبار",
        created_by: fieldUserId,
      })
      .select()
      .single();

    try {
      // The database promoted it before the dashboard ever saw it — no approval click needed.
      await expect(async () => {
        const { data } = await service
          .from("added_holdings")
          .select("status, promoted_holding_id, reviewed_by")
          .eq("id", added!.id)
          .single();
        expect(data!.status).toBe("approved");
        expect(data!.promoted_holding_id).toBeTruthy();
        expect(data!.reviewed_by).toBe(fieldUserId);
      }).toPass({ timeout: 10_000 });

      await loginAsAdmin(page);
      await page.goto("/review");
      await expect(page.getByText("شخص جديد للاختبار التلقائي")).toBeVisible({ timeout: 15_000 });

      const row = page.getByRole("row", { name: /شخص جديد للاختبار التلقائي/ });
      await expect(row.getByText("موافق عليه")).toBeVisible();
      await expect(row.getByText(fieldUserName)).toBeVisible();
      await expect(row.getByRole("button", { name: "موافقة" })).not.toBeVisible();

      await page.goto("/audit");
      await expect(page.getByText(/شخص جديد للاختبار التلقائي/).first()).toBeVisible({ timeout: 15_000 });
    } finally {
      const { data: fresh } = await service
        .from("added_holdings")
        .select("promoted_holding_id")
        .eq("id", added!.id)
        .single();
      if (fresh?.promoted_holding_id) {
        await service.from("holdings").delete().eq("id", fresh.promoted_holding_id);
      }
      await service.from("added_holdings").delete().eq("id", added!.id);
    }
  });

  test("adding a parcel for an existing person copies their official holding number", async ({ page }) => {
    const { data: parent } = await service
      .from("holdings")
      .insert({
        city_id: TEST_CITY_ID,
        holding_id_number: "E2E-OFFICIAL-1",
        holder_name: "صاحب حيازة قائم للاختبار",
        national_id: "77777777777777",
        feddan: 2,
      })
      .select()
      .single();

    const { data: added } = await service
      .from("added_holdings")
      .insert({
        city_id: TEST_CITY_ID,
        client_id: crypto.randomUUID(),
        parent_holding_id: parent!.id,
        holder_name: "صاحب حيازة قائم للاختبار",
        national_id: "77777777777777",
        feddan: 1,
        created_by: fieldUserId,
      })
      .select()
      .single();

    try {
      await expect(async () => {
        const { data: refreshed } = await service
          .from("added_holdings")
          .select("promoted_holding_id")
          .eq("id", added!.id)
          .single();
        expect(refreshed!.promoted_holding_id).toBeTruthy();

        const { data: newParcel } = await service
          .from("holdings")
          .select("holding_id_number")
          .eq("id", refreshed!.promoted_holding_id)
          .single();
        expect(newParcel!.holding_id_number).toBe("E2E-OFFICIAL-1");
      }).toPass({ timeout: 10_000 });
    } finally {
      const { data: fresh } = await service
        .from("added_holdings")
        .select("promoted_holding_id")
        .eq("id", added!.id)
        .single();
      if (fresh?.promoted_holding_id) {
        await service.from("holdings").delete().eq("id", fresh.promoted_holding_id);
      }
      await service.from("added_holdings").delete().eq("id", added!.id);
      await service.from("holdings").delete().eq("id", parent!.id);
    }
  });
});
