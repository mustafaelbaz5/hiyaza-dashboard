import { describe, expect, it } from "vitest";
import { buildExportFilename } from "./build-export-filename";
import type { UnifiedExportRow } from "../types";

function makeRow(overrides: Partial<UnifiedExportRow> = {}): UnifiedExportRow {
  return {
    id: "1",
    city_id: "city-1",
    import_batch_id: null,
    holding_id_number: null,
    unified_number: null,
    holder_name: null,
    national_id: null,
    land_number: null,
    page_number: null,
    basin_name: null,
    basin_code: null,
    association_name: null,
    administration: null,
    directorate: null,
    border_east: null,
    border_west: null,
    border_south: null,
    border_north: null,
    feddan: 0,
    qirat: 0,
    sahm: 0,
    total_sqm: null,
    is_stale: false,
    imported_at: null,
    dedup_key: null,
    soil_type: null,
    growth_stages: null,
    holder_name_farmer_card: null,
    owner_name_farmer_card: null,
    person_id: null,
    credit_type: null,
    crop_type: null,
    is_delegate: null,
    is_inheritance: null,
    notes: null,
    owner_name: null,
    usage_type: null,
    reform_type: null,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    city_name: "الدير",
    association_type: null,
    association_subtype: null,
    classification: null,
    short_code: null,
    ...overrides,
  };
}

const today = new Date("2026-08-07T00:00:00Z");

describe("buildExportFilename", () => {
  it("uses the city name and today's date when every row belongs to one city", () => {
    const rows = [makeRow({ city_name: "الدير" }), makeRow({ city_name: "الدير" })];
    expect(buildExportFilename(rows, today)).toBe("الدير-2026-08-07.xlsx");
  });

  it("falls back to a generic name when rows span more than one city", () => {
    const rows = [makeRow({ city_name: "الدير" }), makeRow({ city_name: "أخرى" })];
    expect(buildExportFilename(rows, today)).toBe("holdings-export-2026-08-07.xlsx");
  });

  it("falls back to a generic name when city_name is missing", () => {
    const rows = [makeRow({ city_name: null })];
    expect(buildExportFilename(rows, today)).toBe("holdings-export-2026-08-07.xlsx");
  });

  it("falls back to a generic name for an empty export", () => {
    expect(buildExportFilename([], today)).toBe("holdings-export-2026-08-07.xlsx");
  });

  it("strips filesystem-forbidden characters from the city name", () => {
    const rows = [makeRow({ city_name: 'جمعية/الدير:1' })];
    expect(buildExportFilename(rows, today)).toBe("جمعيةالدير1-2026-08-07.xlsx");
  });
});
