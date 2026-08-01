"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { FIELD_LABELS, type EditableField } from "@/features/holdings/core/editable-fields";
import { useHoldingEditDiff } from "../hooks/use-holding-edit-diff";

/** Expanded field-level before -> after diff for one holding_edits row. */
export function HoldingEditDiffView({ holdingId, editId }: { holdingId: string; editId: string }) {
  const { data, isLoading } = useHoldingEditDiff(holdingId, editId, true);

  if (isLoading) {
    return <Skeleton className="h-16 w-full" />;
  }

  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">لا توجد فروقات — القيم لم تتغير</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-start text-muted-foreground">
          <th className="p-1 text-start">الحقل</th>
          <th className="p-1 text-start">قبل</th>
          <th className="p-1 text-start">بعد</th>
        </tr>
      </thead>
      <tbody>
        {data.map((d) => (
          <tr key={d.field} className="border-t border-border">
            <td className="p-1 font-medium">{FIELD_LABELS[d.field as EditableField] ?? d.field}</td>
            <td className="p-1 text-muted-foreground">{String(d.before ?? "—")}</td>
            <td className="p-1 text-primary">{String(d.after ?? "—")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
