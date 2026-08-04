import { ASSOCIATION_TYPE_LABELS } from "@/lib/constants";
import type { UnifiedDatasetRow } from "./build-unified-dataset";

/** The exact 25-column export schema matching the Excel template. Each column is bound to
 * specific business rules agreed with the team. Order and naming are fixed.
 *
 * Columns 1–2 are pure system identifiers (UUIDs) — never business values. Column 3 (رقم
 * الحيازة) and column 12 (رقم القطعة) are distinct business fields (holding number vs. parcel/
 * land number respectively) and must never be confused with the ID columns or each other. */
export interface ExcelExportRow {
  "كود القطعة": string; // 1: Parcel ID (internal holding UUID)
  "كود الشخص": string; // 2: Person ID (internal person UUID)
  "رقم الحيازة": string; // 3: real DB-stored holding number
  "كود الجمعية الزراعية": string; // 4: Association Code — always empty for now
  "اسم الجمعية": string; // 5: Association Name
  "نوع الجمعية": string; // 6: Association Type
  "تصنيف الجمعيات الزراعية": string; // 7: Association Classification
  "اسم المالك من الحصر الميداني": string; // 8: Field Survey Owner Name
  "الرقم القومي للمالك": string; // 9: Owner National ID — no source, always empty
  "اسم الحائز من الحصر الميداني": string; // 10: Field Survey Holder Name
  "الرقم القومي للحائز": string; // 11: Holder National ID
  "رقم القطعة": string; // 12: business parcel/land number (landNumber)
  "المساحة الكلية للحيازة": string; // 13: Total Area (sqm)
  فدان: string; // 14: Feddan
  قيراط: string; // 15: Qirat
  سهم: string; // 16: Sahm
  "كود الحوض": string; // 17: Basin Code — always empty for now
  "اسم الحوض": string; // 18: Basin Name
  "نوع التربة": string; // 19: Soil Type
  "نوع الاستخدام": string; // 20: Usage Type (defaults to "زراعي")
  "نوع المحصول": string; // 21: Crop Type
  "مراحل النمو": string; // 22: Growth Stage — no default, empty if missing
  "اسم الحائز من كارت الفلاح": string; // 23: Farmer Card Holder Name
  "اسم المالك من كارت الفلاح": string; // 24: Farmer Card Owner Name
  "ملاحظات من فريق العمل الميداني": string; // 25: Field Team Notes
}

const DEFAULT_USAGE_TYPE = "زراعي";
const DEFAULT_SOIL_TYPE = "طينية";

/** Maps fully-merged dataset rows to the exact 25-column Excel export format.
 * This is the single source of truth for column order and business rules. */
export function mapToExcelRow(row: UnifiedDatasetRow): ExcelExportRow {
  return {
    "كود القطعة": row.id,
    "كود الشخص": row.personId ?? "",
    "رقم الحيازة": row.holdingIdNumber ?? "",
    "كود الجمعية الزراعية": "", // always empty — no placeholder
    "اسم الجمعية": row.cityName ?? "",
    "نوع الجمعية": row.associationType ? ASSOCIATION_TYPE_LABELS[row.associationType] : "",
    "تصنيف الجمعيات الزراعية": row.classification ?? "",
    "اسم المالك من الحصر الميداني": row.ownerName ?? row.holderName ?? "", // fallback to holder if no distinct owner
    "الرقم القومي للمالك": "", // no owner_national_id source exists — always empty
    "اسم الحائز من الحصر الميداني": row.holderName ?? "",
    "الرقم القومي للحائز": row.nationalId ?? "",
    "رقم القطعة": row.landNumber ?? "", // business parcel/land number — empty if unavailable (no placeholder)
    "المساحة الكلية للحيازة": row.totalSqm != null ? String(row.totalSqm) : "",
    فدان: String(row.feddan),
    قيراط: String(row.qirat),
    سهم: String(row.sahm),
    "كود الحوض": "", // always empty — no "-1" placeholder
    "اسم الحوض": row.basinName ?? "",
    "نوع التربة": row.soilType ?? DEFAULT_SOIL_TYPE,
    "نوع الاستخدام": row.usageType && row.usageType.trim() !== "" ? row.usageType : DEFAULT_USAGE_TYPE,
    "نوع المحصول": row.cropType ?? "",
    "مراحل النمو": row.growthStages ?? "", // no agreed default exists; empty if missing
    "اسم الحائز من كارت الفلاح": row.holderNameFarmerCard ?? row.holderName ?? "",
    "اسم المالك من كارت الفلاح": row.ownerNameFarmerCard ?? row.ownerName ?? row.holderName ?? "",
    "ملاحظات من فريق العمل الميداني": row.notes ?? "",
  };
}

/** Builds the complete Excel workbook header row in the exact 25-column order. */
export function buildExcelHeader(): ExcelExportRow {
  return {
    "كود القطعة": "كود القطعة",
    "كود الشخص": "كود الشخص",
    "رقم الحيازة": "رقم الحيازة",
    "كود الجمعية الزراعية": "كود الجمعية الزراعية",
    "اسم الجمعية": "اسم الجمعية",
    "نوع الجمعية": "نوع الجمعية",
    "تصنيف الجمعيات الزراعية": "تصنيف الجمعيات الزراعية",
    "اسم المالك من الحصر الميداني": "اسم المالك من الحصر الميداني",
    "الرقم القومي للمالك": "الرقم القومي للمالك",
    "اسم الحائز من الحصر الميداني": "اسم الحائز من الحصر الميداني",
    "الرقم القومي للحائز": "الرقم القومي للحائز",
    "رقم القطعة": "رقم القطعة",
    "المساحة الكلية للحيازة": "المساحة الكلية للحيازة",
    فدان: "فدان",
    قيراط: "قيراط",
    سهم: "سهم",
    "كود الحوض": "كود الحوض",
    "اسم الحوض": "اسم الحوض",
    "نوع التربة": "نوع التربة",
    "نوع الاستخدام": "نوع الاستخدام",
    "نوع المحصول": "نوع المحصول",
    "مراحل النمو": "مراحل النمو",
    "اسم الحائز من كارت الفلاح": "اسم الحائز من كارت الفلاح",
    "اسم المالك من كارت الفلاح": "اسم المالك من كارت الفلاح",
    "ملاحظات من فريق العمل الميداني": "ملاحظات من فريق العمل الميداني",
  };
}
