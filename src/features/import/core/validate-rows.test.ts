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
    const { valid, rejected } = validateRows([makeRow()]);
    expect(valid).toHaveLength(1);
    expect(rejected).toHaveLength(0);
  });

  it("rejects a row with no holder name", () => {
    const { valid, rejected } = validateRows([makeRow({ holderName: null })]);
    expect(valid).toHaveLength(0);
    expect(rejected).toHaveLength(1);
    expect(rejected[0]!.column).toBe("اسم الحائز");
  });

  it("does not reject a malformed national id — imports it as-is for the quality board to flag", () => {
    const { valid, rejected } = validateRows([makeRow({ nationalId: "not-a-valid-id" })]);
    expect(valid).toHaveLength(1);
    expect(rejected).toHaveLength(0);
    expect(valid[0]!.nationalId).toBe("not-a-valid-id");
  });

  it("never double counts a row as both valid and rejected", () => {
    const rows = [makeRow(), makeRow({ holderName: null }), makeRow({ nationalId: "bad" })];
    const { valid, rejected } = validateRows(rows);
    expect(valid.length + rejected.length).toBe(rows.length);
  });

  it("rejects a fractional سهم — the real schema column is int and rounding would corrupt a legal land share", () => {
    const { valid, rejected } = validateRows([makeRow({ sahm: 10.75 })]);
    expect(valid).toHaveLength(0);
    expect(rejected).toHaveLength(1);
    expect(rejected[0]!.column).toBe("سهم");
  });

  it("accepts integer feddan/qirat/sahm", () => {
    const { valid, rejected } = validateRows([makeRow({ feddan: 2, qirat: 5, sahm: 10 })]);
    expect(valid).toHaveLength(1);
    expect(rejected).toHaveLength(0);
  });
});
