import { ASSOCIATION_TYPE_LABELS } from "@/lib/constants";
import type { UnifiedDatasetRow } from "./build-unified-dataset";

/** The exact 25-column export schema matching the Excel template. Each column is bound to
 * specific business rules from the field-population walkthrough. Order and naming are fixed. */
export interface ExcelExportRow {
  "رقم الشخص": string;                                  // 1: Person ID
  "رقم الحيازة": string;                                // 2: Holding ID
  "كود الجمعية الزراعية": string;                      // 3: Association Code (short_code)
  "اسم الجمعية الزراعية": string;                      // 4: Association Name
  "نوع الجمعية الزراعية": string;                      // 5: Association Type
  "تصنيف الجمعيات الزراعية": string;                  // 6: Association Classification
  "اسم المالك": string;                                 // 7: Field Survey Owner Name
  "الرقم القومي للمالك": string;                      // 8: Field Survey Owner National ID
  "اسم المستحوذ": string;                              // 9: Field Survey Holder Name
  "الرقم القومي للمستحوذ": string;                     // 10: Field Survey Holder National ID
  "رقم الحيازة الحقلية": string;                      // 11: Holding ID Number
  "رقم الأرض": string;                                 // 12: Land Number
  "الاتجاه الشرقي": string;                             // 13: Border East
  "الاتجاه الغربي": string;                             // 14: Border West
  "الاتجاه الجنوبي": string;                            // 15: Border South
  "الاتجاه الشمالي": string;                            // 16: Border North
  "كود الحوض": string;                                 // 17: Basin Code (default "-1" if missing)
  "اسم الحوض": string;                                 // 18: Basin Name
  "الفدادين": string;                                  // 19: Feddan (stringified for Excel)
  "القيراط": string;                                   // 20: Qirat (stringified for Excel)
  "الساهم": string;                                    // 21: Sahm (stringified for Excel)
  "نوع الاستخدام": string;                            // 22: Usage Type
  "نوع المحصول": string;                              // 23: Crop Type
  "مرحلة النمو": string;                               // 24: Growth Stage
  "ملاحظات الفريق الميداني": string;                  // 25: Field Team Notes
}

/** Maps fully-merged dataset rows to the exact 25-column Excel export format.
 * This is the single source of truth for column order and business rules. */
export function mapToExcelRow(row: UnifiedDatasetRow): ExcelExportRow {
  return {
    "رقم الشخص": row.personId ?? "",
    "رقم الحيازة": row.id,
    "كود الجمعية الزراعية": row.shortCode ?? "",
    "اسم الجمعية الزراعية": row.cityName ?? "",
    "نوع الجمعية الزراعية":
      row.associationType ? ASSOCIATION_TYPE_LABELS[row.associationType] : "",
    "تصنيف الجمعيات الزراعية": row.classification ?? "",
    "اسم المالك": row.ownerName ?? row.holderName ?? "", // fallback to holder if no owner
    "الرقم القومي للمالك": row.nationalId ?? "", // TODO: verify owner_national_id if available
    "اسم المستحوذ": row.holderName ?? "",
    "الرقم القومي للمستحوذ": row.nationalId ?? "",
    "رقم الحيازة الحقلية": row.holdingIdNumber ?? "",
    "رقم الأرض": row.landNumber ?? "", // empty if unavailable (no placeholder)
    "الاتجاه الشرقي": row.borderEast ?? "",
    "الاتجاه الغربي": row.borderWest ?? "",
    "الاتجاه الجنوبي": row.borderSouth ?? "",
    "الاتجاه الشمالي": row.borderNorth ?? "",
    "كود الحوض": row.basinCode ?? "-1", // "-1" is the default for missing
    "اسم الحوض": row.basinName ?? "",
    "الفدادين": String(row.feddan),
    "القيراط": String(row.qirat),
    "الساهم": String(row.sahm),
    "نوع الاستخدام": row.usageType ?? "",
    "نوع المحصول": row.cropType ?? "",
    "مرحلة النمو": row.growthStages ?? "", // placeholder column; genuinely unavailable
    "ملاحظات الفريق الميداني": row.notes ?? "",
  };
}

/** Builds the complete Excel workbook header row in the exact 25-column order. */
export function buildExcelHeader(): ExcelExportRow {
  return {
    "رقم الشخص": "رقم الشخص",
    "رقم الحيازة": "رقم الحيازة",
    "كود الجمعية الزراعية": "كود الجمعية الزراعية",
    "اسم الجمعية الزراعية": "اسم الجمعية الزراعية",
    "نوع الجمعية الزراعية": "نوع الجمعية الزراعية",
    "تصنيف الجمعيات الزراعية": "تصنيف الجمعيات الزراعية",
    "اسم المالك": "اسم المالك",
    "الرقم القومي للمالك": "الرقم القومي للمالك",
    "اسم المستحوذ": "اسم المستحوذ",
    "الرقم القومي للمستحوذ": "الرقم القومي للمستحوذ",
    "رقم الحيازة الحقلية": "رقم الحيازة الحقلية",
    "رقم الأرض": "رقم الأرض",
    "الاتجاه الشرقي": "الاتجاه الشرقي",
    "الاتجاه الغربي": "الاتجاه الغربي",
    "الاتجاه الجنوبي": "الاتجاه الجنوبي",
    "الاتجاه الشمالي": "الاتجاه الشمالي",
    "كود الحوض": "كود الحوض",
    "اسم الحوض": "اسم الحوض",
    "الفدادين": "الفدادين",
    "القيراط": "القيراط",
    "الساهم": "الساهم",
    "نوع الاستخدام": "نوع الاستخدام",
    "نوع المحصول": "نوع المحصول",
    "مرحلة النمو": "مرحلة النمو",
    "ملاحظات الفريق الميداني": "ملاحظات الفريق الميداني",
  };
}
