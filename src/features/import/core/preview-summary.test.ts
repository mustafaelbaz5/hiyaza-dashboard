import { describe, expect, it } from "vitest";
import { buildPreviewSummary } from "./preview-summary";
import type { MappedHoldingRow } from "./map-rows";

function makeRow(overrides: Partial<MappedHoldingRow>): MappedHoldingRow {
  return {
    sourceRowNumber: 4,
    holdingIdNumber: "101",
    holderName: "احمد",
    nationalId: null,
    landNumber: "1",
    feddan: 0,
    qirat: 0,
    sahm: 0,
    totalSqm: null,
    borderEast: null,
    borderWest: null,
    borderSouth: null,
    borderNorth: null,
    pageNumber: "1",
    basinCode: "-1",
    basinName: "البشيط",
    associationName: "الدير",
    administration: null,
    directorate: null,
    parcelCountCheck: null,
    unifiedNumber: null,
    ...overrides,
  };
}

describe("buildPreviewSummary", () => {
  it("detects the association name by majority vote across rows", () => {
    const rows = [
      makeRow({ associationName: "الدير" }),
      makeRow({ associationName: "الدير" }),
      makeRow({ associationName: "أخرى" }),
    ];
    const summary = buildPreviewSummary(rows, [], 3, [], new Set());
    expect(summary.detectedAssociationName).toBe("الدير");
  });

  it("computes new/changed/removed diff against existing unified numbers", () => {
    const rows = [
      makeRow({ unifiedNumber: "A" }),
      makeRow({ unifiedNumber: "B" }),
    ];
    const summary = buildPreviewSummary(rows, [], 2, [], new Set(["B", "C"]));
    expect(summary.diff).toEqual({ newCount: 1, changedCount: 1, removedCount: 1 });
  });

  it("lists distinct basins sorted", () => {
    const rows = [
      makeRow({ basinName: "ب" }),
      makeRow({ basinName: "أ" }),
      makeRow({ basinName: "ب" }),
    ];
    const summary = buildPreviewSummary(rows, [], 3, [], new Set());
    expect(summary.detectedBasins).toEqual(["أ", "ب"]);
  });

  it("carries through skipped-sheets and rejection info unchanged", () => {
    const summary = buildPreviewSummary(
      [],
      [{ row: 5, column: "اسم الحائز", reason: "مفقود" }],
      1,
      [{ name: "البشيط", reason: "ورقة عرض مكررة" }],
      new Set(),
    );
    expect(summary.rowsRejected).toBe(1);
    expect(summary.skippedSheets).toHaveLength(1);
  });
});
