"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useImportHistory } from "../hooks/use-import-history";
import { useRollbackImport } from "../hooks/use-rollback-import";
import type { ImportBatchSummary } from "../types";
import { formatDate } from "@/lib/format";

const STATUS_LABELS: Record<string, string> = {
  committed: "مكتمل",
  rolled_back: "تم التراجع",
  failed: "فشل",
  pending: "قيد الانتظار",
};

/** Import batch history — the rollback control from DASHBOARD_PLAN.md § 6.7's control list. */
export function ImportHistory({ cityId }: { cityId: string }) {
  const { data, isLoading, error, refetch } = useImportHistory(cityId);
  const rollback = useRollbackImport(cityId);
  const [confirmingBatchId, setConfirmingBatchId] = useState<string | null>(null);
  const rows = useMemo(() => data ?? [], [data]);

  function handleRollback() {
    if (!confirmingBatchId) return;
    rollback.mutate(confirmingBatchId, {
      onSuccess: () => {
        toast.success("تم التراجع عن الاستيراد");
        setConfirmingBatchId(null);
      },
      onError: () => toast.error("تعذر التراجع عن الاستيراد"),
    });
  }

  const columns: ColumnDef<ImportBatchSummary>[] = [
    { accessorKey: "fileName", header: "اسم الملف" },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => <Badge variant="secondary">{STATUS_LABELS[row.original.status] ?? row.original.status}</Badge>,
    },
    { accessorKey: "rowsImported", header: "صفوف مستوردة" },
    {
      accessorKey: "rowsDuplicate",
      header: "صفوف مكررة",
      cell: ({ row }) =>
        row.original.rowsDuplicate === null ? "—" : row.original.rowsDuplicate,
    },
    { accessorKey: "rowsRejected", header: "صفوف فارغة/فشلت" },
    {
      accessorKey: "committedAt",
      header: "تاريخ الاعتماد",
      cell: ({ row }) =>
        formatDate(row.original.committedAt, { dateStyle: "medium", timeStyle: "short" }),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.status === "committed" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmingBatchId(row.original.id)}
          >
            <RotateCcw />
            تراجع
          </Button>
        ) : null,
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        error={error ? "تعذر تحميل سجل الاستيراد" : undefined}
        onRetry={() => refetch()}
        emptyTitle="لا يوجد سجل استيراد بعد"
        emptyDescription="ارفع أول ملف Excel لهذه الجمعية"
      />

      <AlertDialog open={Boolean(confirmingBatchId)} onOpenChange={(open) => !open && setConfirmingBatchId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>التراجع عن هذا الاستيراد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف كل الحيازات التي جاءت من هذا الاستيراد، وإعادة تفعيل الاستيراد السابق. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleRollback} disabled={rollback.isPending}>
              {rollback.isPending ? "جاري التراجع..." : "تراجع"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
