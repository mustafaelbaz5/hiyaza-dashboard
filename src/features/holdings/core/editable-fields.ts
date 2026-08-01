/** The subset of holdings columns a correction may touch — identifiers/provenance stay fixed. */
export const EDITABLE_FIELDS = [
  "holder_name",
  "national_id",
  "land_number",
  "page_number",
  "basin_name",
  "basin_code",
  "association_name",
  "administration",
  "directorate",
  "border_east",
  "border_west",
  "border_south",
  "border_north",
  "feddan",
  "qirat",
  "sahm",
  "total_sqm",
] as const;

export type EditableField = (typeof EDITABLE_FIELDS)[number];

export const FIELD_LABELS: Record<EditableField, string> = {
  holder_name: "اسم الحائز",
  national_id: "الرقم القومي",
  land_number: "رقم الأرض",
  page_number: "رقم الصفحة",
  basin_name: "اسم الحوض",
  basin_code: "كود الحوض",
  association_name: "الجمعية",
  administration: "الإدارة",
  directorate: "المديرية",
  border_east: "الشرقى",
  border_west: "الغربى",
  border_south: "القبلى",
  border_north: "البحرى",
  feddan: "فدان",
  qirat: "قيراط",
  sahm: "سهم",
  total_sqm: "المساحة بالمتر",
};
