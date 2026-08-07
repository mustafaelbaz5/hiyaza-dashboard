import { describe, expect, it } from "vitest";
import { buildHoldingsCsv } from "./export-csv";
import type { MergedHolding } from "./merge-holding";

function makeRow(overrides: Partial<MergedHolding> = {}): MergedHolding {
  return {
    id: "h1",
    city_id: "c1",
    holding_id_number: "101",
    unified_number: "06-1",
    holder_name: "احمد, محمد",
    national_id: "123",
    land_number: "1",
    page_number: "1",
    basin_name: "البشيط",
    basin_code: "-1",
    association_name: null,
    administration: null,
    directorate: null,
    border_east: null,
    border_west: null,
    border_south: null,
    border_north: null,
    feddan: 1,
    qirat: 0,
    sahm: 0,
    total_sqm: 100,
    is_stale: false,
    imported_at: "2026-01-01",
    credit_type: "ملك",
    reform_type: null,
    usage_type: "زراعة",
    crop_type: null,
    owner_name: null,
    growth_stages: null,
    is_delegate: false,
    is_inheritance: false,
    notes: null,
    soil_type: null,
    isEdited: false,
    editedFields: [],
    provenance: "original",
    ...overrides,
  };
}

describe("buildHoldingsCsv", () => {
  it("includes a header row and one data row per holding", () => {
    const csv = buildHoldingsCsv([makeRow()]);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("رقم الحيازة");
  });

  it("quotes and escapes cells containing commas", () => {
    const csv = buildHoldingsCsv([makeRow()]);
    expect(csv).toContain('"احمد, محمد"');
  });

  it("renders null fields as empty cells, not the literal 'null'", () => {
    const csv = buildHoldingsCsv([makeRow({ total_sqm: null })]);
    expect(csv).not.toContain("null");
  });
});
