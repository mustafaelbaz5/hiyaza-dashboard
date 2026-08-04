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

/**
 * `holding_edits.payload` is written by the Flutter app (see DASHBOARD_ID_ALIGNMENT.md) using its
 * own Dart model's camelCase field names, not this table's snake_case column names — a payload
 * looks like `{ holderName, basinCode, nationalId, ... }`, never `{ holder_name, basin_code, ... }`.
 * Every consumer of a raw edit payload must translate through this map before treating it as an
 * EditPayload; reading payload[field] directly with a snake_case field name silently finds
 * nothing for every Flutter-originated edit.
 */
export const EDIT_PAYLOAD_KEY_MAP: Record<EditableField, string> = {
  holder_name: "holderName",
  national_id: "nationalId",
  land_number: "landNumber",
  page_number: "pageNumber",
  basin_name: "basinName",
  basin_code: "basinCode",
  association_name: "associationName",
  administration: "administration",
  directorate: "directorate",
  border_east: "borderEast",
  border_west: "borderWest",
  border_south: "borderSouth",
  border_north: "borderNorth",
  feddan: "feddan",
  qirat: "qirat",
  sahm: "sahm",
  total_sqm: "totalSqm",
};

/**
 * Payload keys the Flutter app writes that have no EditableField counterpart yet — these belong
 * to `added_holdings`-only concepts (ownership/usage/crop metadata), not the `holdings` columns
 * EDITABLE_FIELDS models today. Tracked here so a future extension of EditableField to cover them
 * isn't rediscovering this list from scratch: cropType, usageType, creditType, isDelegate,
 * isInheritance, ownerName, notes, reformType.
 */
