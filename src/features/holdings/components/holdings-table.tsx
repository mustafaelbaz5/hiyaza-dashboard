"use client";

import { useMemo, useState } from "react";
import type { ColumnDef, SortingState, RowSelectionState } from "@tanstack/react-table";
import { Download, PencilLine } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHoldings } from "../hooks/use-holdings";
import { useBasins } from "../hooks/use-basins";
import { useExportHoldings } from "../hooks/use-export-holdings";
import { InlineEditCell } from "./inline-edit-cell";
import { BulkEditDialog } from "./bulk-edit-dialog";
import type { MergedHolding } from "../core/merge-holding";
import type { HoldingsListFilters } from "../types";

const PAGE_SIZE = 25;

function buildColumns(cityId: string): ColumnDef<MergedHolding>[] {
  return [
    { accessorKey: "holding_id_number", header: "رقم الحيازة" },
    { accessorKey: "unified_number", header: "الرقم الموحد" },
    {
      accessorKey: "holder_name",
      header: "اسم الحائز",
      cell: ({ row }) => <InlineEditCell holding={row.original} field="holder_name" cityId={cityId} />,
    },
    {
      accessorKey: "national_id",
      header: "الرقم القومي",
      cell: ({ row }) => <InlineEditCell holding={row.original} field="national_id" cityId={cityId} />,
    },
    {
      accessorKey: "basin_name",
      header: "اسم الحوض",
      cell: ({ row }) => <InlineEditCell holding={row.original} field="basin_name" cityId={cityId} />,
    },
    {
      accessorKey: "feddan",
      header: "فدان",
      cell: ({ row }) => <InlineEditCell holding={row.original} field="feddan" cityId={cityId} />,
    },
    {
      accessorKey: "qirat",
      header: "قيراط",
      cell: ({ row }) => <InlineEditCell holding={row.original} field="qirat" cityId={cityId} />,
    },
  ];
}

/** Full holdings data explorer for a city — server-paginated table, inline edit, bulk edit, export. */
export function HoldingsTable({ cityId }: { cityId: string }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [search, setSearch] = useState("");
  const [basinName, setBasinName] = useState<string>("");
  const [bulkEditOpen, setBulkEditOpen] = useState(false);

  const filters: HoldingsListFilters = { search: search || undefined, basinName: basinName || undefined };
  const { data, isLoading, error, refetch } = useHoldings({
    cityId,
    filters,
    sortBy: sorting[0]?.id,
    sortDirection: sorting[0]?.desc ? "desc" : "asc",
    pageIndex,
    pageSize: PAGE_SIZE,
  });
  const { data: basins } = useBasins(cityId);
  const exportHoldings = useExportHoldings(cityId);

  const columns = useMemo(() => buildColumns(cityId), [cityId]);
  const rows = useMemo(() => data?.rows ?? [], [data]);
  const selectedIds = useMemo(
    () => rows.filter((_, i) => rowSelection[i]).map((r) => r.id),
    [rows, rowSelection],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="بحث بالاسم أو الرقم القومي..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPageIndex(0);
          }}
          className="max-w-xs"
        />
        <Select
          value={basinName || "all"}
          onValueChange={(v) => {
            setBasinName(v === "all" ? "" : v);
            setPageIndex(0);
          }}
        >
          <SelectTrigger className="w-48" aria-label="تصفية حسب الحوض">
            <SelectValue placeholder="كل الأحواض" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأحواض</SelectItem>
            {(basins ?? []).map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          disabled={selectedIds.length === 0}
          onClick={() => setBulkEditOpen(true)}
        >
          <PencilLine />
          تعديل جماعي ({selectedIds.length})
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportHoldings.mutate(filters)}
          disabled={exportHoldings.isPending}
        >
          <Download />
          تصدير
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={rows}
        totalRows={data?.totalCount}
        isLoading={isLoading}
        error={error ? "تعذر تحميل الحيازات" : undefined}
        onRetry={() => refetch()}
        emptyTitle="لا توجد حيازات"
        emptyDescription="لم يتم استيراد أي بيانات لهذه الجمعية بعد"
        sorting={sorting}
        onSortingChange={setSorting}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        pageIndex={pageIndex}
        pageSize={PAGE_SIZE}
        onPageChange={setPageIndex}
        pageCount={data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0}
      />

      <BulkEditDialog
        cityId={cityId}
        selectedIds={selectedIds}
        open={bulkEditOpen}
        onOpenChange={setBulkEditOpen}
        onApplied={() => setRowSelection({})}
      />
    </div>
  );
}
