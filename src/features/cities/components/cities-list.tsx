"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { CityStatusBadge } from "./city-status-badge";
import { useCities } from "../hooks/use-cities";
import type { CityWithStats } from "../types";
import { formatDate, formatNumber } from "@/lib/format";

const columns: ColumnDef<CityWithStats>[] = [
  {
    accessorKey: "name",
    header: "الجمعية",
    cell: ({ row }) => (
      <Link href={`/cities/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  { accessorKey: "administration", header: "الإدارة", cell: ({ row }) => row.original.administration ?? "—" },
  { accessorKey: "directorate", header: "المديرية", cell: ({ row }) => row.original.directorate ?? "—" },
  {
    accessorKey: "holdingsCount",
    header: "عدد الحيازات",
    cell: ({ row }) => formatNumber(row.original.holdingsCount),
  },
  {
    accessorKey: "lastImportAt",
    header: "آخر استيراد",
    cell: ({ row }) => formatDate(row.original.lastImportAt),
  },
  {
    accessorKey: "status",
    header: "الحالة",
    cell: ({ row }) => <CityStatusBadge status={row.original.status} />,
  },
];

/** Cities list — fetches via useCities, renders through the shared DataTable. */
export function CitiesList() {
  const { data, isLoading, error, refetch } = useCities();
  const rows = useMemo(() => data ?? [], [data]);

  return (
    <DataTable
      columns={columns}
      data={rows}
      isLoading={isLoading}
      error={error ? "تعذر تحميل قائمة الجمعيات" : undefined}
      onRetry={() => refetch()}
      emptyTitle="لا توجد جمعيات بعد"
      emptyDescription="ابدأ بإضافة أول جمعية للنظام"
    />
  );
}
