import { describe, expect, it } from "vitest";
import { validateRows } from "./validate-rows";
import type { MappedHoldingRow } from "./map-rows";

function makeRow(overrides: Partial<MappedHoldingRow> = {}): MappedHoldingRow {
  return {
    sourceRowNumber: 4,
    holdingIdNumber: "101",
    holderName: "احمد محمد",
    nationalId: "12345678901234",
    landNumber: "123",
    feddan: 1,
    qirat: 0,
    sahm: 0,
    totalSqm: 4200,
    borderEast: null,
    borderWest: null,
    borderSouth: null,
    borderNorth: null,
    pageNumber: "1",
    basinCode: "-1",
    basinName: "البشيط",
    associationName: "الدير",
    administration: "اجا",
    directorate: "الدقهليه",
    parcelCountCheck: 1,
    unifiedNumber: "06-1-1-1",
    ...overrides,
  };
}

describe("validateRows", () => {
  it("accepts a well-formed row", () => {
    const { valid, blank } = validateRows([makeRow()]);
    expect(valid).toHaveLength(1);
    expect(blank).toHaveLength(0);
  });

  it("imports a row with no holder name — missing business data is not an import error", () => {
    const { valid, blank } = validateRows([makeRow({ holderName: null })]);
    expect(valid).toHaveLength(1);
    expect(blank).toHaveLength(0);
  });

  it("does not reject a malformed national id — imports it as-is for the quality board to flag", () => {
    const { valid, blank } = validateRows([makeRow({ nationalId: "not-a-valid-id" })]);
    expect(valid).toHaveLength(1);
    expect(blank).toHaveLength(0);
    expect(valid[0]!.nationalId).toBe("not-a-valid-id");
  });

  it("never double counts a row as both valid and blank", () => {
    const rows = [makeRow(), makeRow({ holderName: null }), makeRow({ nationalId: "bad" })];
    const { valid, blank } = validateRows(rows);
    expect(valid.length + blank.length).toBe(rows.length);
  });

  it("imports a fractional سهم as-is — the source spreadsheet is the source of truth", () => {
    const { valid, blank } = validateRows([makeRow({ sahm: 10.75 })]);
    expect(valid).toHaveLength(1);
    expect(blank).toHaveLength(0);
    expect(valid[0]!.sahm).toBe(10.75);
  });

  it("accepts integer feddan/qirat/sahm", () => {
    const { valid, blank } = validateRows([makeRow({ feddan: 2, qirat: 5, sahm: 10 })]);
    expect(valid).toHaveLength(1);
    expect(blank).toHaveLength(0);
  });

  it("sets aside a row with no data in any field as blank, not valid", () => {
    const { valid, blank } = validateRows([
      makeRow({
        holdingIdNumber: null,
        unifiedNumber: null,
        holderName: null,
        nationalId: null,
        landNumber: null,
        pageNumber: null,
        basinCode: null,
        basinName: null,
        associationName: null,
        administration: null,
        directorate: null,
        borderEast: null,
        borderWest: null,
        borderSouth: null,
        borderNorth: null,
        feddan: 0,
        qirat: 0,
        sahm: 0,
        totalSqm: 0,
      }),
    ]);
    expect(valid).toHaveLength(0);
    expect(blank).toHaveLength(1);
    expect(blank[0]!.row).toBe(4);
  });
});
