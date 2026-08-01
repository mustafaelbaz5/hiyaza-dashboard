import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readWorkbook } from "./read-workbook";
import { locateHeaderRow } from "./locate-header-row";
import { mapRows } from "./map-rows";
import { DEFAULT_COLUMN_MAPPING } from "./column-mapping";

const FIXTURE_PATH = join(process.cwd(), "e2e/fixtures/الدير_ائتمان_مجمع.xlsx");

function loadMainSheetRows() {
  const buffer = readFileSync(FIXTURE_PATH);
  const parsed = readWorkbook(buffer);
  if (!parsed.ok) throw new Error("fixture failed to parse");
  const sheet = parsed.value.sheets.find((s) => s.name === "جميع البيانات");
  if (!sheet) throw new Error("sheet missing");
  const header = locateHeaderRow(sheet.rows, DEFAULT_COLUMN_MAPPING);
  if (!header.ok) throw new Error("header not found");
  return { rows: sheet.rows, header: header.value };
}

describe("mapRows", () => {
  it("maps exactly 1202 data rows from the real sample", () => {
    const { rows, header } = loadMainSheetRows();
    const mapped = mapRows(rows, header, DEFAULT_COLUMN_MAPPING);
    expect(mapped).toHaveLength(1202);
  });

  it("coerces numeric source cells (land/page number) to text", () => {
    const { rows, header } = loadMainSheetRows();
    const mapped = mapRows(rows, header, DEFAULT_COLUMN_MAPPING);
    const first = mapped[0]!;
    expect(typeof first.landNumber).toBe("string");
    expect(first.landNumber).toBe("10862326");
  });

  it("preserves Arabic text intact with no encoding damage", () => {
    const { rows, header } = loadMainSheetRows();
    const mapped = mapRows(rows, header, DEFAULT_COLUMN_MAPPING);
    const first = mapped[0]!;
    expect(first.holderName).toBe("ابراهيم  الشبراوي محمد منصور");
    expect(first.basinName).toBe("البشيط");
  });

  it("defaults basin_code to '-1' when blank, matching APP_PLAN.md § 6", () => {
    const { rows, header } = loadMainSheetRows();
    const mapped = mapRows(rows, header, DEFAULT_COLUMN_MAPPING);
    expect(mapped.every((r) => r.basinCode === "-1")).toBe(true);
  });

  it("parses feddan/qirat/sahm as numbers", () => {
    const { rows, header } = loadMainSheetRows();
    const mapped = mapRows(rows, header, DEFAULT_COLUMN_MAPPING);
    const first = mapped[0]!;
    expect(first.feddan).toBe(0);
    expect(first.qirat).toBe(12);
    expect(first.sahm).toBe(16);
  });

  it("reads the stable unified_number identifier", () => {
    const { rows, header } = loadMainSheetRows();
    const mapped = mapRows(rows, header, DEFAULT_COLUMN_MAPPING);
    expect(mapped[0]!.unifiedNumber).toBe("06-3230-00323905-001159");
  });
});
