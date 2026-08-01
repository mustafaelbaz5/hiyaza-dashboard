"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { ReviewStatusBadge } from "./review-status-badge";
import { ApproveDialog } from "./approve-dialog";
import { RejectDialog } from "./reject-dialog";
import { useReviewQueue } from "../hooks/use-review-queue";
import { formatDate } from "@/lib/format";
import type { AddedHolding } from "../types";

/**
 * Field-added records log. Every submission auto-promotes into `holdings` immediately (no
 * manual approval step) — this table is now primarily a "who added what, when" history, not a
 * gate. Approve/reject stay available for the rare row that isn't already approved.
 */
export function ReviewQueueTable({ cityId }: { cityId?: string }) {
  const { data, isLoading, error, refetch } = useReviewQueue({ cityId });
  const [approving, setApproving] = useState<AddedHolding | null>(null);
  const [rejecting, setRejecting] = useState<AddedHolding | null>(null);
  const rows = useMemo(() => data ?? [], [data]);

  const columns: ColumnDef<AddedHolding>[] = [
    { accessorKey: "holderName", header: "اسم الحائز" },
    { accessorKey: "nationalId", header: "الرقم القومي", cell: ({ row }) => row.original.nationalId ?? "—" },
    { accessorKey: "basinName", header: "اسم الحوض", cell: ({ row }) => row.original.basinName ?? "—" },
    {
      accessorKey: "createdByName",
      header: "أضافه",
      cell: ({ row }) => row.original.createdByName ?? "—",
    },
    {
      accessorKey: "createdAt",
      header: "تاريخ الإضافة",
      cell: ({ row }) => formatDate(row.original.createdAt, { dateStyle: "medium", timeStyle: "short" }),
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => <ReviewStatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.status === "pending" ? (
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => setApproving(row.original)}>
              <Check />
              موافقة
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setRejecting(row.original)}>
              <X />
              رفض
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        error={error ? "تعذر تحميل سجل الإضافات" : undefined}
        onRetry={() => refetch()}
        emptyTitle="لا توجد سجلات بعد"
        emptyDescription="سيظهر هنا كل ما يضيفه فريق الميدان — يُضاف تلقائيًا للنظام فور إرساله"
      />
      <ApproveDialog record={approving} onOpenChange={(open) => !open && setApproving(null)} />
      <RejectDialog record={rejecting} onOpenChange={(open) => !open && setRejecting(null)} />
    </>
  );
}
