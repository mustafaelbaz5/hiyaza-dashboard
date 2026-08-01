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

/** Review queue: field-added records with approve/reject actions (DASHBOARD_PLAN.md § 6.5). */
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
      accessorKey: "createdAt",
      header: "تاريخ الإضافة",
      cell: ({ row }) => formatDate(row.original.createdAt),
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
        error={error ? "تعذر تحميل قائمة المراجعة" : undefined}
        onRetry={() => refetch()}
        emptyTitle="لا توجد سجلات بانتظار المراجعة"
        emptyDescription="سيظهر هنا أي بيانات أضافها فريق الميدان"
      />
      <ApproveDialog record={approving} onOpenChange={(open) => !open && setApproving(null)} />
      <RejectDialog record={rejecting} onOpenChange={(open) => !open && setRejecting(null)} />
    </>
  );
}
