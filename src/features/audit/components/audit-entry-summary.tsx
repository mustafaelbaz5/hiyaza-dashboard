import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import type { AuditEntryWithUser } from "../types";

const ENTITY_LABELS: Record<AuditEntryWithUser["entityType"], string> = {
  import: "استيراد",
  holding_edit: "تعديل حيازة",
  added_holding: "سجل ميداني",
  city_management: "إدارة جمعية",
  user_management: "إدارة مستخدم",
};

const STATUS_LABELS: Record<string, string> = {
  approved: "أُضيف تلقائيًا للنظام",
  pending: "بانتظار المراجعة",
  rejected: "مرفوض",
};

/** One-line human-readable summary of an audit_feed row's `details` JSON, per entity type. */
export function AuditEntrySummary({ entry }: { entry: AuditEntryWithUser }) {
  const d = entry.details;

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline">{ENTITY_LABELS[entry.entityType]}</Badge>
      {entry.entityType === "import" ? (
        <span>
          استورد {String(d.file_name)} — {String(d.rows_imported)} صف
        </span>
      ) : null}
      {entry.entityType === "holding_edit" ? (
        <span className="flex items-center gap-1.5">
          عدّل بيانات حيازة
          {d.target_was_stale ? (
            <Badge variant="outline" className="gap-1 border-amber-500 text-amber-700">
              <AlertTriangle className="size-3" />
              حيازة قديمة
            </Badge>
          ) : null}
        </span>
      ) : null}
      {entry.entityType === "added_holding" ? (
        <span>
          {String(d.holder_name)} — {STATUS_LABELS[String(d.status)] ?? String(d.status)}
          {d.rejection_reason ? ` (${d.rejection_reason})` : ""}
        </span>
      ) : null}
      {entry.entityType === "city_management" ? (
        <span>
          {String(d.action_type)}: {String(d.entity_name)}
        </span>
      ) : null}
      {entry.entityType === "user_management" ? (
        <span>
          {String(d.action_type)}: {String(d.entity_name)}
        </span>
      ) : null}
    </div>
  );
}
