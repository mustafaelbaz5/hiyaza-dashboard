import { describe, expect, it } from "vitest";
import { buildExcelHeader, type ExcelExportRow } from "./excel-mapper";
import { EXPECTED_HEADER_ORDER } from "./excel-mapper.test-fixtures";

describe("excel-mapper: buildExcelHeader", () => {
  it("returns exactly 25 columns in the exact required order", () => {
    const header = buildExcelHeader();
    expect(Object.keys(header)).toEqual(EXPECTED_HEADER_ORDER);
  });

  it("header values match the keys (identity mapping)", () => {
    const header = buildExcelHeader();
    for (const [key, value] of Object.entries(header)) {
      expect(value).toBe(key);
    }
  });

  it("does not include the removed border-direction columns", () => {
    const keys = Object.keys(buildExcelHeader());
    expect(keys).not.toContain("الاتجاه الشرقي");
    expect(keys).not.toContain("الاتجاه الغربي");
    expect(keys).not.toContain("الاتجاه الجنوبي");
    expect(keys).not.toContain("الاتجاه الشمالي");
  });
});

// Compile-time check: ExcelExportRow must not resurrect the removed border-direction columns.
type _NoBorders = ExcelExportRow extends { "الاتجاه الشرقي": unknown } ? never : true;
const _noBordersCheck: _NoBorders = true;
void _noBordersCheck;
