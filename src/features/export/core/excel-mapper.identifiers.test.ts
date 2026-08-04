import { describe, expect, it } from "vitest";
import { mapToExcelRow } from "./excel-mapper";
import { sampleRow } from "./excel-mapper.test-fixtures";

describe("excel-mapper: ID vs business-field separation (columns 1-3, 12)", () => {
  it("column 1 (كود القطعة): maps the internal holding UUID (id)", () => {
    const row = mapToExcelRow(sampleRow);
    expect(row["كود القطعة"]).toBe("h-uuid-001");
  });

  it("column 2 (كود الشخص): maps personId", () => {
    const row = mapToExcelRow(sampleRow);
    expect(row["كود الشخص"]).toBe("p-uuid-001");
  });

  it("column 3 (رقم الحيازة): maps the real DB holding number, not any UUID", () => {
    const row = mapToExcelRow(sampleRow);
    expect(row["رقم الحيازة"]).toBe("5423");
    // Columns 1, 2, and 3 must never collapse to the same source value
    expect(row["رقم الحيازة"]).not.toBe(row["كود القطعة"]);
    expect(row["رقم الحيازة"]).not.toBe(row["كود الشخص"]);
  });

  it("column 12 (رقم القطعة): maps the business parcel/land number, empty if unavailable (no placeholder)", () => {
    const row = mapToExcelRow(sampleRow);
    expect(row["رقم القطعة"]).toBe("100");
    // Must be a business number, never a UUID from either ID column
    expect(row["رقم القطعة"]).not.toBe(row["كود القطعة"]);
    expect(row["رقم القطعة"]).not.toBe(row["كود الشخص"]);

    const rowNoLand = { ...sampleRow, landNumber: null };
    expect(mapToExcelRow(rowNoLand)["رقم القطعة"]).toBe("");
  });
});
