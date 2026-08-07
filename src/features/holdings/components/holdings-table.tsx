"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ColumnDef, SortingState, RowSelectionState } from "@tanstack/react-table";
import { PencilLine, SquareArrowOutUpRight } from "lucide-react";
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
import { ExportDialog } from "@/features/export/components/export-dialog";
import { InlineEditCell } from "./inline-edit-cell";
import { BulkEditDialog } from "./bulk-edit-dialog";
import { ProvenanceBadge } from "./provenance-badge";
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
    {
      id: "provenance",
      header: "المصدر",
      cell: ({ row }) => <ProvenanceBadge provenance={row.original.provenance} />,
    },
    {
      id: "details",
      header: "",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" className="size-8" asChild>
          <Link href={`/cities/${cityId}/holdings/${row.original.id}`} aria-label="عرض التفاصيل">
            <SquareArrowOutUpRight className="size-4" />
          </Link>
        </Button>
      ),
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

  const columns = useMemo(() => buildColumns(cityId), [cityId]);
  const rows = useMemo(() => data?.rows ?? [], [data]);
  const selectedHoldings = useMemo(
    () => rows.filter((_, i) => rowSelection[i]),
    [rows, rowSelection],
  );
  const selectedIds = useMemo(() => selectedHoldings.map((r) => r.id), [selectedHoldings]);

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
        <ExportDialog cityId={cityId} variant="outline" size="sm" label="تصدير" />
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
        selectedHoldings={selectedHoldings}
        open={bulkEditOpen}
        onOpenChange={setBulkEditOpen}
        onApplied={() => setRowSelection({})}
      />
    </div>
  );
}
