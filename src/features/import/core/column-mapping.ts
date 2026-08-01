/**
 * A ColumnMapping is data, not code (OCP escape hatch, DASHBOARD_PLAN.md § 3.1): a new city
 * Excel layout is a new registry entry, never a parser change.
 */
export interface ColumnMapping {
  id: string;
  /** Sheet name to parse; every other sheet in the workbook is reported as skipped. */
  dataSheetName: string;
  /** Header label -> domain field. Matched by text, never by column position (APP_PLAN.md § 4). */
  fields: Record<string, string>;
  /** Domain fields whose source cells are numeric and must be coerced to text. */
  coerceToText: string[];
}

/** The verified layout of الدير_ائتمان_مجمع.xlsx and (until proven otherwise) every city like it. */
export const DEFAULT_COLUMN_MAPPING: ColumnMapping = {
  id: "default-20-column",
  dataSheetName: "جميع البيانات",
  fields: {
    "رقم الحيازة": "holdingIdNumber",
    "اسم الحائز": "holderName",
    "الرقم القومي": "nationalId",
    "رقم الارض": "landNumber",
    "فدان": "feddan",
    "قيراط": "qirat",
    "سهم": "sahm",
    "المساحه بالمتر": "totalSqm",
    "الشرقى": "borderEast",
    "الغربى": "borderWest",
    "القبلى": "borderSouth",
    "البحرى": "borderNorth",
    "رقم الصفحة": "pageNumber",
    "كود الحوض": "basinCode",
    "اسم الحوض": "basinName",
    "الجمعيه": "associationName",
    "الأداره": "administration",
    "المديريه": "directorate",
    "عدد القطع بالحيازة": "parcelCountCheck",
    "الرقم الموحد للحيازة": "unifiedNumber",
  },
  coerceToText: ["landNumber", "pageNumber", "basinCode"],
};

export const MAPPING_REGISTRY: ColumnMapping[] = [DEFAULT_COLUMN_MAPPING];

/** Sheets that are redundant filtered views of the main sheet — always skipped, never parsed. */
export function isSkippableSheet(sheetName: string, mapping: ColumnMapping): boolean {
  return sheetName !== mapping.dataSheetName;
}
