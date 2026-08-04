import type { AuditEntryWithUser } from "../types";

/** Converts audit entries to CSV format for download. */
export function auditEntriesToCSV(entries: AuditEntryWithUser[]): string {
  if (entries.length === 0) {
    return "نوع النشاط,معرف الكيان,معرف المدينة,المستخدم,البريد,الوقت,التفاصيل\n";
  }

  // CSV header
  const headers = [
    "نوع النشاط",
    "معرف الكيان",
    "معرف المدينة",
    "المستخدم",
    "البريد",
    "الوقت",
    "التفاصيل",
  ];

  // Convert entries to rows
  const rows = entries.map((entry) => [
    escapeCSV(entry.entityType),
    escapeCSV(entry.entityId),
    escapeCSV(entry.cityId),
    escapeCSV(entry.userDisplayName || "—"),
    escapeCSV(entry.userEmail || "—"),
    escapeCSV(entry.occurredAt),
    escapeCSV(JSON.stringify(entry.details)),
  ]);

  // Combine header and rows
  const lines = [headers.map(escapeCSV).join(","), ...rows.map((r) => r.join(","))];
  return lines.join("\n");
}

/** Escapes a field for CSV format (wraps in quotes, escapes internal quotes). */
function escapeCSV(field: unknown): string {
  const str = String(field ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Converts CSV string to Blob and triggers browser download. */
export function downloadAuditCSV(entries: AuditEntryWithUser[]): void {
  const csv = auditEntriesToCSV(entries);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const filename = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
