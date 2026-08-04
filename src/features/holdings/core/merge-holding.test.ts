import { describe, expect, it } from "vitest";
import {
  mergeHolding,
  buildEditPayload,
  normalizeEditPayload,
  type HoldingBaseRow,
  type MergedHolding,
} from "./merge-holding";

function makeBase(overrides: Partial<HoldingBaseRow> = {}): HoldingBaseRow {
  return {
    id: "h1",
    city_id: "c1",
    holding_id_number: "101",
    unified_number: "06-1-1-1",
    holder_name: "احمد محمد",
    national_id: "12345678901234",
    land_number: "123",
    page_number: "1",
    basin_name: "البشيط",
    basin_code: "-1",
    association_name: "الدير",
    administration: "اجا",
    directorate: "الدقهليه",
    border_east: null,
    border_west: null,
    border_south: null,
    border_north: null,
    feddan: 1,
    qirat: 0,
    sahm: 0,
    total_sqm: 4200,
    is_stale: false,
    imported_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("mergeHolding", () => {
  it("returns the base row unedited when there is no edit payload", () => {
    const base = makeBase();
    const merged = mergeHolding(base, null);
    expect(merged.isEdited).toBe(false);
    expect(merged.editedFields).toEqual([]);
    expect(merged.holder_name).toBe("احمد محمد");
  });

  it("never mutates the base row — holdings stays immutable", () => {
    const base = makeBase();
    const frozenBase = { ...base };
    mergeHolding(base, { holder_name: "اسم جديد" });
    expect(base).toEqual(frozenBase);
  });

  it("overlays only fields present in the edit payload", () => {
    const base = makeBase();
    const merged = mergeHolding(base, { holder_name: "اسم جديد" });
    expect(merged.holder_name).toBe("اسم جديد");
    expect(merged.national_id).toBe("12345678901234");
    expect(merged.editedFields).toEqual(["holder_name"]);
    expect(merged.isEdited).toBe(true);
  });

  it("does not count a field as edited if the payload value matches the original", () => {
    const base = makeBase();
    const merged = mergeHolding(base, { holder_name: base.holder_name });
    expect(merged.editedFields).toEqual([]);
    expect(merged.isEdited).toBe(false);
  });

  it("treats the edit payload as a full snapshot, not a diff", () => {
    const base = makeBase();
    const merged = mergeHolding(base, { holder_name: "اسم جديد", feddan: 5 });
    expect(merged.holder_name).toBe("اسم جديد");
    expect(merged.feddan).toBe(5);
    expect(merged.editedFields.sort()).toEqual(["feddan", "holder_name"]);
  });
});

describe("buildEditPayload", () => {
  it("carries forward every editable field's current value, changing only the target field", () => {
    const base = makeBase();
    const current: MergedHolding = { ...base, isEdited: false, editedFields: [] };
    const payload = buildEditPayload(current, "holder_name", "اسم محدث");

    expect(payload.holder_name).toBe("اسم محدث");
    expect(payload.national_id).toBe(base.national_id);
    expect(payload.feddan).toBe(base.feddan);
  });
});

describe("normalizeEditPayload", () => {
  it("translates a real Flutter-shaped camelCase payload into snake_case EditableField keys", () => {
    // Matches the actual shape of holding_edits.payload as written by the Flutter app —
    // this is the exact bug this function exists to fix (see DASHBOARD_ID_ALIGNMENT.md).
    const rawPayload = {
      holderName: "محمد احمد",
      nationalId: "29510251202211",
      landNumber: "12850776",
      pageNumber: "1",
      basinName: "الزيانه",
      basinCode: "-1",
      administration: "اجا",
      directorate: "الدقهليه",
      feddan: 0,
      qirat: 8,
      sahm: 12,
      totalSqm: 1487.72,
      // Flutter-only fields with no EditableField counterpart yet — must be ignored, not error.
      cropType: "ارز",
      usageType: "زراعة",
      isDelegate: false,
      notes: null,
    };

    const normalized = normalizeEditPayload(rawPayload);

    expect(normalized).not.toBeNull();
    expect(normalized!.holder_name).toBe("محمد احمد");
    expect(normalized!.national_id).toBe("29510251202211");
    expect(normalized!.basin_code).toBe("-1");
    expect(normalized!.feddan).toBe(0);
    expect(normalized!.sahm).toBe(12);
  });

  it("returns null for a null payload", () => {
    expect(normalizeEditPayload(null)).toBeNull();
  });

  it("only sets keys actually present in the raw payload", () => {
    const normalized = normalizeEditPayload({ holderName: "احمد" });
    expect(normalized).toEqual({ holder_name: "احمد" });
    expect(normalized!.national_id).toBeUndefined();
  });

  it("end-to-end: a real Flutter edit payload, once normalized, correctly overlays onto mergeHolding", () => {
    const base = makeBase();
    const rawFlutterPayload = { holderName: "اسم جديد بعد التعديل", feddan: 5 };

    const normalized = normalizeEditPayload(rawFlutterPayload);
    const merged = mergeHolding(base, normalized);

    expect(merged.holder_name).toBe("اسم جديد بعد التعديل");
    expect(merged.feddan).toBe(5);
    expect(merged.isEdited).toBe(true);
  });
});
