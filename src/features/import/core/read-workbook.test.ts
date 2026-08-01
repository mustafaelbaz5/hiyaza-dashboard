import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readWorkbook } from "./read-workbook";

const FIXTURE_PATH = join(process.cwd(), "e2e/fixtures/الدير_ائتمان_مجمع.xlsx");

describe("readWorkbook", () => {
  it("parses all 9 sheets from the real sample workbook", () => {
    const buffer = readFileSync(FIXTURE_PATH);
    const result = readWorkbook(buffer);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.sheets).toHaveLength(9);
    expect(result.value.sheets.map((s) => s.name)).toContain("جميع البيانات");
    expect(result.value.sheets.map((s) => s.name)).toContain("بيانات ناقصة");
  });

  it("parses non-xlsx text via SheetJS's CSV fallback rather than throwing — locateHeaderRow is what rejects it", () => {
    const result = readWorkbook(Buffer.from("not an excel file"));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.sheets[0]?.name).toBe("Sheet1");
  });
});
