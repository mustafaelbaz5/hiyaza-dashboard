import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readWorkbook } from "./read-workbook";
import { locateHeaderRow } from "./locate-header-row";
import { DEFAULT_COLUMN_MAPPING } from "./column-mapping";

const FIXTURE_PATH = join(process.cwd(), "e2e/fixtures/الدير_ائتمان_مجمع.xlsx");

describe("locateHeaderRow", () => {
  it("finds the header at row index 2 (row 3) in the real sample, not row 0", () => {
    const buffer = readFileSync(FIXTURE_PATH);
    const parsed = readWorkbook(buffer);
    if (!parsed.ok) throw new Error("fixture failed to parse");

    const sheet = parsed.value.sheets.find((s) => s.name === "جميع البيانات");
    if (!sheet) throw new Error("sheet missing");

    const result = locateHeaderRow(sheet.rows, DEFAULT_COLUMN_MAPPING);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.rowIndex).toBe(2);
    expect(Object.keys(result.value.columnIndexes)).toHaveLength(20);
  });

  it("fails loudly when no row matches enough known labels", () => {
    const rows = [
      ["random", "data", "here"],
      ["more", "junk"],
    ];
    const result = locateHeaderRow(rows, DEFAULT_COLUMN_MAPPING);
    expect(result.ok).toBe(false);
  });

  it("fails loudly on a corrupt/non-workbook file (this is the actual rejection point in the pipeline)", () => {
    const result = locateHeaderRow([["not an excel file"]], DEFAULT_COLUMN_MAPPING);
    expect(result.ok).toBe(false);
  });

  it("finds the header even if shifted to a different row", () => {
    const rows = [
      ["metadata row 1"],
      ["metadata row 2"],
      ["metadata row 3"],
      ["metadata row 4"],
      Object.keys(DEFAULT_COLUMN_MAPPING.fields),
      ["101", "holder", "12345678901234"],
    ];
    const result = locateHeaderRow(rows, DEFAULT_COLUMN_MAPPING);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.rowIndex).toBe(4);
  });
});
