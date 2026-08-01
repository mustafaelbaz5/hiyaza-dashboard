import { describe, expect, it } from "vitest";
import { checkParcelCounts } from "./check-parcel-counts";
import type { MappedHoldingRow } from "./map-rows";

function makeRow(overrides: Partial<MappedHoldingRow>): MappedHoldingRow {
  return {
    sourceRowNumber: 4,
    holdingIdNumber: "101",
    holderName: "احمد محمد",
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
    basinName: null,
    associationName: null,
    administration: null,
    directorate: null,
    parcelCountCheck: 1,
    unifiedNumber: null,
    ...overrides,
  };
}

describe("checkParcelCounts", () => {
  it("finds no mismatch when actual rows match the declared count", () => {
    const rows = [
      makeRow({ holdingIdNumber: "101", parcelCountCheck: 2 }),
      makeRow({ holdingIdNumber: "101", parcelCountCheck: 2 }),
    ];
    expect(checkParcelCounts(rows)).toHaveLength(0);
  });

  it("flags a holding whose actual row count differs from column S", () => {
    const rows = [makeRow({ holdingIdNumber: "101", parcelCountCheck: 3 })];
    const mismatches = checkParcelCounts(rows);
    expect(mismatches).toHaveLength(1);
    expect(mismatches[0]).toEqual({ holdingIdNumber: "101", expected: 3, actual: 1 });
  });

  it("ignores rows without a holding id number", () => {
    const rows = [makeRow({ holdingIdNumber: null, parcelCountCheck: 5 })];
    expect(checkParcelCounts(rows)).toHaveLength(0);
  });
});
