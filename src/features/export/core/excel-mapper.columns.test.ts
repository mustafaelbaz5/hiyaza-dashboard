import { describe, expect, it } from "vitest";
import { mapToExcelRow } from "./excel-mapper";
import { emptyRow, EXPECTED_HEADER_ORDER, sampleRow } from "./excel-mapper.test-fixtures";

describe("excel-mapper: mapToExcelRow shape", () => {
  it("maps all 25 fields in the exact required order", () => {
    const row = mapToExcelRow(sampleRow);
    expect(Object.keys(row)).toEqual(EXPECTED_HEADER_ORDER);
  });

  it("never omits columns (all 25 present even if every source field is null)", () => {
    const row = mapToExcelRow(emptyRow);
    expect(Object.keys(row)).toEqual(EXPECTED_HEADER_ORDER);

    expect(row["كود الشخص"]).toBe("");
    expect(row["كود الجمعية الزراعية"]).toBe("");
    expect(row["الرقم القومي للمالك"]).toBe("");
    expect(row["كود الحوض"]).toBe("");
    expect(row["نوع الاستخدام"]).toBe("زراعي"); // only column with a non-empty default
  });
});

describe("excel-mapper: association fields (columns 4-7)", () => {
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
});

describe("excel-mapper: holder/owner fields (columns 8-11)", () => {
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
});

describe("excel-mapper: parcel/area fields (columns 13-16)", () => {
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
});

describe("excel-mapper: basin/soil/usage/crop fields (columns 17-22)", () => {
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

  it("column 19 (نوع التربة): maps soilType, defaults to 'طينية' when missing", () => {
    const row = mapToExcelRow(sampleRow);
    expect(row["نوع التربة"]).toBe("رملي");

    const rowNoSoil = { ...sampleRow, soilType: null };
    expect(mapToExcelRow(rowNoSoil)["نوع التربة"]).toBe("طينية");
  });

  it("column 20 (نوع الاستخدام): reads from the database, defaults to 'زراعي' when null or empty", () => {
    const row = mapToExcelRow(sampleRow);
    expect(row["نوع الاستخدام"]).toBe("زراعة");

    const rowNullUsage = { ...sampleRow, usageType: null };
    expect(mapToExcelRow(rowNullUsage)["نوع الاستخدام"]).toBe("زراعي");

    // holdings.usage_type/added_holdings.usage_type are `not null default ''` in the live schema —
    // an empty string, not null, is the actual "missing" value the DB sends. `??` alone would miss
    // this case; the mapper must treat '' as missing too.
    const rowEmptyUsage = { ...sampleRow, usageType: "" };
    expect(mapToExcelRow(rowEmptyUsage)["نوع الاستخدام"]).toBe("زراعي");
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
});

describe("excel-mapper: farmer-card and notes fields (columns 23-25)", () => {
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
});
