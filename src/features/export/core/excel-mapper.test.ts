import { describe, it, expect } from "vitest";
import { buildExcelHeader, mapToExcelRow, type ExcelExportRow } from "./excel-mapper";
import type { UnifiedDatasetRow } from "./build-unified-dataset";

const EXPECTED_HEADER_ORDER = [
  "رقم الشخص",
  "رقم القطعة",
  "رقم الحيازة",
  "كود الجمعية الزراعية",
  "اسم الجمعية",
  "نوع الجمعية",
  "تصنيف الجمعيات الزراعية",
  "اسم المالك من الحصر الميداني",
  "الرقم القومي للمالك",
  "اسم الحائز من الحصر الميداني",
  "الرقم القومي للحائز",
  "رقم الأرض",
  "المساحة الكلية للحيازة",
  "فدان",
  "قيراط",
  "سهم",
  "كود الحوض",
  "اسم الحوض",
  "نوع التربة",
  "نوع الاستخدام",
  "نوع المحصول",
  "مراحل النمو",
  "اسم الحائز من كارت الفلاح",
  "اسم المالك من كارت الفلاح",
  "ملاحظات من فريق العمل الميداني",
];

describe("excel-mapper", () => {
  describe("buildExcelHeader", () => {
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

  describe("mapToExcelRow", () => {
    const sampleRow: UnifiedDatasetRow = {
      id: "h-uuid-001",
      cityId: "c-uuid-001",
      personId: "p-uuid-001",
      cityName: "جمعية الشرقية",
      associationType: "agricultural_reform",
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

    it("maps all 25 fields in the exact required order", () => {
      const row = mapToExcelRow(sampleRow);
      expect(Object.keys(row)).toEqual(EXPECTED_HEADER_ORDER);
    });

    it("column 1 (رقم الشخص): maps personId", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["رقم الشخص"]).toBe("p-uuid-001");
    });

    it("column 2 (رقم القطعة): maps the internal holding UUID (id)", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["رقم القطعة"]).toBe("h-uuid-001");
    });

    it("column 3 (رقم الحيازة): maps the real DB holding number, not the UUID", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["رقم الحيازة"]).toBe("5423");
      // Columns 2 and 3 must never collapse to the same source value
      expect(row["رقم الحيازة"]).not.toBe(row["رقم القطعة"]);
    });

    it("column 4 (كود الجمعية الزراعية): always empty, ignores shortCode", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["كود الجمعية الزراعية"]).toBe("");

      const rowNoCode = { ...sampleRow, shortCode: null };
      expect(mapToExcelRow(rowNoCode)["كود الجمعية الزراعية"]).toBe("");
    });

    it("column 5 (اسم الجمعية): maps cityName", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["اسم الجمعية"]).toBe("جمعية الشرقية");
    });

    it("column 6 (نوع الجمعية): maps association type label", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["نوع الجمعية"]).toBe("الإصلاح الزراعي");

      const rowNoType = { ...sampleRow, associationType: null };
      expect(mapToExcelRow(rowNoType)["نوع الجمعية"]).toBe("");
    });

    it("column 7 (تصنيف الجمعيات الزراعية): maps classification", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["تصنيف الجمعيات الزراعية"]).toBe("استصلاح");
    });

    it("column 8 (اسم المالك من الحصر الميداني): uses ownerName, falls back to holderName", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["اسم المالك من الحصر الميداني"]).toBe("أحمد محمد");

      const rowNoOwner = { ...sampleRow, ownerName: null };
      expect(mapToExcelRow(rowNoOwner)["اسم المالك من الحصر الميداني"]).toBe("محمد علي");

      const rowNoOwnerOrHolder = { ...sampleRow, ownerName: null, holderName: null };
      expect(mapToExcelRow(rowNoOwnerOrHolder)["اسم المالك من الحصر الميداني"]).toBe("");
    });

    it("column 9 (الرقم القومي للمالك): always empty, no owner_national_id source exists", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["الرقم القومي للمالك"]).toBe("");
    });

    it("column 10 (اسم الحائز من الحصر الميداني): maps holderName", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["اسم الحائز من الحصر الميداني"]).toBe("محمد علي");
    });

    it("column 11 (الرقم القومي للحائز): maps nationalId", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["الرقم القومي للحائز"]).toBe("12345678901234");
    });

    it("column 12 (رقم الأرض): empty string if unavailable (no placeholder)", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["رقم الأرض"]).toBe("100");

      const rowNoLand = { ...sampleRow, landNumber: null };
      expect(mapToExcelRow(rowNoLand)["رقم الأرض"]).toBe("");
    });

    it("column 13 (المساحة الكلية للحيازة): maps totalSqm", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["المساحة الكلية للحيازة"]).toBe("5000");

      const rowNoArea = { ...sampleRow, totalSqm: null };
      expect(mapToExcelRow(rowNoArea)["المساحة الكلية للحيازة"]).toBe("");
    });

    it("columns 14-16 (فدان/قيراط/سهم): stringified numbers", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["فدان"]).toBe("1");
      expect(row["قيراط"]).toBe("2");
      expect(row["سهم"]).toBe("3");
      expect(typeof row["فدان"]).toBe("string");
    });

    it("column 17 (كود الحوض): always empty, no '-1' placeholder", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["كود الحوض"]).toBe("");

      const rowNoBasin = { ...sampleRow, basinCode: null };
      expect(mapToExcelRow(rowNoBasin)["كود الحوض"]).toBe("");
    });

    it("column 18 (اسم الحوض): maps basinName", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["اسم الحوض"]).toBe("حوض الشرقية");
    });

    it("column 19 (نوع التربة): maps soilType", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["نوع التربة"]).toBe("رملي");
    });

    it("column 20 (نوع الاستخدام): defaults to 'زراعي' when missing", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["نوع الاستخدام"]).toBe("زراعة");

      const rowNoUsage = { ...sampleRow, usageType: null };
      expect(mapToExcelRow(rowNoUsage)["نوع الاستخدام"]).toBe("زراعي");
    });

    it("column 21 (نوع المحصول): maps cropType, empty if missing", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["نوع المحصول"]).toBe("قمح");

      const rowNoCrop = { ...sampleRow, cropType: null };
      expect(mapToExcelRow(rowNoCrop)["نوع المحصول"]).toBe("");
    });

    it("column 22 (مراحل النمو): empty string, no agreed default exists", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["مراحل النمو"]).toBe("");

      const rowWithGrowth = { ...sampleRow, growthStages: "مرحلة النمو الثانية" };
      expect(mapToExcelRow(rowWithGrowth)["مراحل النمو"]).toBe("مرحلة النمو الثانية");
    });

    it("column 23 (اسم الحائز من كارت الفلاح): falls back to field-survey holder name", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["اسم الحائز من كارت الفلاح"]).toBe("محمد علي");

      const rowWithCard = { ...sampleRow, holderNameFarmerCard: "اسم من الكارت" };
      expect(mapToExcelRow(rowWithCard)["اسم الحائز من كارت الفلاح"]).toBe("اسم من الكارت");
    });

    it("column 24 (اسم المالك من كارت الفلاح): falls back to field-survey owner/holder name", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["اسم المالك من كارت الفلاح"]).toBe("أحمد محمد");

      const rowWithCard = { ...sampleRow, ownerNameFarmerCard: "مالك من الكارت" };
      expect(mapToExcelRow(rowWithCard)["اسم المالك من كارت الفلاح"]).toBe("مالك من الكارت");
    });

    it("column 25 (ملاحظات من فريق العمل الميداني): maps notes", () => {
      const row = mapToExcelRow(sampleRow);
      expect(row["ملاحظات من فريق العمل الميداني"]).toBe("بعض الملاحظات");
    });

    it("never omits columns (all 25 present even if every source field is null)", () => {
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
      expect(Object.keys(row)).toEqual(EXPECTED_HEADER_ORDER);

      expect(row["رقم الشخص"]).toBe("");
      expect(row["كود الجمعية الزراعية"]).toBe("");
      expect(row["الرقم القومي للمالك"]).toBe("");
      expect(row["كود الحوض"]).toBe("");
      expect(row["نوع الاستخدام"]).toBe("زراعي"); // only column with a non-empty default
    });
  });
});

// Compile-time check: ExcelExportRow must not resurrect the removed border-direction columns.
type _NoBorders = ExcelExportRow extends { "الاتجاه الشرقي": unknown } ? never : true;
const _noBordersCheck: _NoBorders = true;
void _noBordersCheck;
