import type { MergedHolding } from "./merge-holding";

const EXPORT_COLUMNS: { key: keyof MergedHolding; label: string }[] = [
  { key: "holding_id_number", label: "رقم الحيازة" },
  { key: "unified_number", label: "الرقم الموحد للحيازة" },
  { key: "holder_name", label: "اسم الحائز" },
  { key: "national_id", label: "الرقم القومي" },
  { key: "land_number", label: "رقم الأرض" },
  { key: "page_number", label: "رقم الصفحة" },
  { key: "basin_name", label: "اسم الحوض" },
  { key: "basin_code", label: "كود الحوض" },
  { key: "feddan", label: "فدان" },
  { key: "qirat", label: "قيراط" },
  { key: "sahm", label: "سهم" },
  { key: "total_sqm", label: "المساحة بالمتر" },
];

function escapeCsvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/** Builds a CSV string from merged holdings — the exported view reflects edits, not raw imports. */
export function buildHoldingsCsv(rows: MergedHolding[]): string {
  const header = EXPORT_COLUMNS.map((c) => c.label).join(",");
  const lines = rows.map((row) =>
    EXPORT_COLUMNS.map((c) => escapeCsvCell(row[c.key])).join(","),
  );
  return [header, ...lines].join("\n");
}
