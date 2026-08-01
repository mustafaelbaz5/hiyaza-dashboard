"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { CityStatusBadge } from "./city-status-badge";
import { DeleteCityDialog } from "./delete-city-dialog";
import { useCities } from "../hooks/use-cities";
import { useSetCityStatus } from "../hooks/use-city-mutations";
import { formatDate, formatNumber } from "@/lib/format";
import type { CityWithStats } from "../types";

function ArchiveAction({ city }: { city: CityWithStats }) {
  const setStatus = useSetCityStatus(city.id);
  if (city.status === "archived") return null;

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={setStatus.isPending}
      onClick={() =>
        setStatus.mutate("archived", {
          onSuccess: () => toast.success("تم أرشفة الجمعية"),
          onError: () => toast.error("تعذر أرشفة الجمعية"),
        })
      }
    >
      أرشفة
    </Button>
  );
}

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
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <ArchiveAction city={row.original} />
        <DeleteCityDialog city={row.original} />
      </div>
    ),
  },
];

/** Full city management table for the Settings page — every city, with archive/delete actions inline. */
export function SettingsCitiesTable() {
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
      emptyDescription="ابدأ بإضافة أول جمعية للنظام من صفحة المدن"
    />
  );
}
