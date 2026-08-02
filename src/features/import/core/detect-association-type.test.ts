import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { readWorkbook } from "./read-workbook";
import { detectAssociationType } from "./detect-association-type";

const FIXTURE_PATH = join(process.cwd(), "e2e/fixtures/الدير_ائتمان_مجمع.xlsx");

describe("detectAssociationType", () => {
  it("detects الائتمان الزراعي from the real sample file's row 1", () => {
    const buffer = readFileSync(FIXTURE_PATH);
    const parsed = readWorkbook(buffer);
    if (!parsed.ok) throw new Error("fixture failed to parse");

    const sheet = parsed.value.sheets.find((s) => s.name === "جميع البيانات");
    if (!sheet) throw new Error("sheet missing");

    const result = detectAssociationType(sheet.rows);
    expect(result.type).toBe("agricultural_credit");
    expect(result.rawLabel).toBe("الائتمان الزراعي");
  });

  it("detects الإصلاح الزراعي from a matching row 1", () => {
    const rows = [["القطاع : الإصلاح الزراعي", null, null]];
    const result = detectAssociationType(rows);
    expect(result.type).toBe("agricultural_reform");
    expect(result.rawLabel).toBe("الإصلاح الزراعي");
  });

  it("never guesses on an unrecognized label — returns type: null with the raw label preserved", () => {
    const rows = [["القطاع : شيء غير معروف", null]];
    const result = detectAssociationType(rows);
    expect(result.type).toBeNull();
    expect(result.rawLabel).toBe("شيء غير معروف");
  });

  it("returns nulls when row 1 doesn't start with القطاع at all", () => {
    const rows = [["رقم الحيازة", "اسم الحائز"]];
    const result = detectAssociationType(rows);
    expect(result.type).toBeNull();
    expect(result.rawLabel).toBeNull();
  });

  it("returns nulls on an empty sheet", () => {
    const result = detectAssociationType([]);
    expect(result.type).toBeNull();
    expect(result.rawLabel).toBeNull();
  });

  it("returns nulls when the first cell isn't a string", () => {
    const rows = [[42, null]];
    const result = detectAssociationType(rows);
    expect(result.type).toBeNull();
    expect(result.rawLabel).toBeNull();
  });
});
