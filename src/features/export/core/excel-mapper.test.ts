import { describe, it, expect } from "vitest";
import { buildExcelHeader, mapToExcelRow, type ExcelExportRow } from "./excel-mapper";
import type { UnifiedDatasetRow } from "./build-unified-dataset";

describe("excel-mapper", () => {
  describe("buildExcelHeader", () => {
    it("returns exactly 25 columns in the correct order", () => {
      const header = buildExcelHeader();
      const keys = Object.keys(header);

      expect(keys).toHaveLength(25);
      expect(keys[0]).toBe("رقم الشخص");
      expect(keys[1]).toBe("رقم الحيازة");
      expect(keys[2]).toBe("كود الجمعية الزراعية");
      expect(keys[24]).toBe("ملاحظات الفريق الميداني");
    });

    it("header values match the keys (identity mapping)", () => {
      const header = buildExcelHeader();
      for (const [key, value] of Object.entries(header)) {
        expect(value).toBe(key);
      }
    });
  });

  describe("mapToExcelRow", () => {
    const sampleRow: UnifiedDatasetRow = {
      id: "h-uuid-001",
      cityId: "c-uuid-001",
      personId: "p-uuid-001",
      cityName: "جمعية الشرقية",
      associationType: null,
      associationSubtype: "نوع فرعي",
      classification: "استصلاح",
      shortCode: "SHQ",
      holderName: "محمد علي",
      nationalId: "12345678901234",
      ownerName: "أحمد محمد",
      holdingIdNumber: "5423",
      landNumber: "100",
      totalSqm: 5000,
      feddan: 1,
      qirat: 2,
      sahm: 3,
      basinCode: "B001",
      basinName: "حوض الشرقية",
      borderEast: "شارع النيل",
      borderWest: "شارع الجيش",
      borderSouth: "طريق القاهرة",
      borderNorth: "طريق الإسكندرية",
      soilType: "رملي",
      usageType: "زراعة",
      cropType: "قمح",
      growthStages: null,
      holderNameFarmerCard: null,
      ownerNameFarmerCard: null,
      notes: "بعض الملاحظات",
    };

    it("maps all 25 fields in correct order", () => {
      const row = mapToExcelRow(sampleRow);
      const keys = Object.keys(row);

      expect(keys).toHaveLength(25);
      expect(keys[0]).toBe("رقم الشخص");
      expect(keys[24]).toBe("ملاحظات الفريق الميداني");
    });

    it("column 1 (رقم الشخص): maps personId", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["رقم الشخص"]).toBe("p-uuid-001");
    });

    it("column 2 (رقم الحيازة): maps id", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["رقم الحيازة"]).toBe("h-uuid-001");
    });

    it("column 3 (كود الجمعية): maps shortCode with empty string fallback", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["كود الجمعية الزراعية"]).toBe("SHQ");

      const rowNoCode = { ...sampleRow, shortCode: null };
      const rowMapped = mapToExcelRow(rowNoCode);
      expect(rowMapped["كود الجمعية الزراعية"]).toBe("");
    });

    it("column 7 (اسم المالك): uses ownerName, falls back to holderName", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["اسم المالك"]).toBe("أحمد محمد");

      const rowNoOwner = { ...sampleRow, ownerName: null };
      const rowMapped = mapToExcelRow(rowNoOwner);
      expect(rowMapped["اسم المالك"]).toBe("محمد علي");

      const rowNoOwnerOrHolder = { ...sampleRow, ownerName: null, holderName: null };
      const rowMapped2 = mapToExcelRow(rowNoOwnerOrHolder);
      expect(rowMapped2["اسم المالك"]).toBe("");
    });

    it("column 12 (رقم الأرض): empty string if unavailable (no placeholder)", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["رقم الأرض"]).toBe("100");

      const rowNoLand = { ...sampleRow, landNumber: null };
      const rowMapped = mapToExcelRow(rowNoLand);
      expect(rowMapped["رقم الأرض"]).toBe("");
    });

    it("column 17 (كود الحوض): uses '-1' as default if missing", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["كود الحوض"]).toBe("B001");

      const rowNoBasin = { ...sampleRow, basinCode: null };
      const rowMapped = mapToExcelRow(rowNoBasin);
      expect(rowMapped["كود الحوض"]).toBe("-1");
    });

    it("column 24 (مرحلة النمو): empty string (placeholder column, genuinely unavailable)", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["مرحلة النمو"]).toBe("");

      // Even if data existed, it should pass through
      const rowWithGrowth = { ...sampleRow, growthStages: "مرحلة النمو الثانية" };
      const rowMapped = mapToExcelRow(rowWithGrowth);
      expect(rowMapped["مرحلة النمو"]).toBe("مرحلة النمو الثانية");
    });

    it("numeric columns (19–21) maintain number type", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["الفدادين"]).toBe(1);
      expect(row["القيراط"]).toBe(2);
      expect(row["الساهم"]).toBe(3);
      expect(typeof row["الفدادين"]).toBe("number");
    });

    it("never omits columns (all 25 present even if null)", () => {
      const emptyRow: UnifiedDatasetRow = {
        id: "test",
        cityId: "test",
        personId: null,
        cityName: null,
        associationType: null,
        associationSubtype: null,
        classification: null,
        shortCode: null,
        holderName: null,
        nationalId: null,
        ownerName: null,
        holdingIdNumber: null,
        landNumber: null,
        totalSqm: null,
        feddan: 0,
        qirat: 0,
        sahm: 0,
        basinCode: null,
        basinName: null,
        borderEast: null,
        borderWest: null,
        borderSouth: null,
        borderNorth: null,
        soilType: null,
        usageType: null,
        cropType: null,
        growthStages: null,
        holderNameFarmerCard: null,
        ownerNameFarmerCard: null,
        notes: null,
      };

      const row = mapToExcelRow(emptyRow);
      expect(Object.keys(row)).toHaveLength(25);

      // Check that all columns exist (even if empty)
      expect(row["رقم الشخص"]).toBe("");
      expect(row["كود الحوض"]).toBe("-1"); // Only this has a non-empty default
    });
  });
});
