"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { useTeamActivity } from "../hooks/use-team-activity";
import { formatDate, formatNumber } from "@/lib/format";
import type { TeamActivityRow } from "../types";

const ROLE_LABELS: Record<string, string> = {
  admin: "مدير",
  editor: "محرر",
  viewer: "مشاهد",
  field: "ميداني",
};

/** Board 4 — per-user activity leaderboard (DASHBOARD_PLAN.md § 6.7 Board 4). */
export function TeamActivityBoard() {
  const { data, isLoading, error, refetch } = useTeamActivity();
  const rows = useMemo(() => data ?? [], [data]);

  const columns: ColumnDef<TeamActivityRow>[] = [
    {
      accessorKey: "display_name",
      header: "المستخدم",
      cell: ({ row }) => row.original.display_name ?? row.original.email,
    },
    {
      accessorKey: "role",
      header: "الدور",
      cell: ({ row }) => (row.original.role ? (ROLE_LABELS[row.original.role] ?? row.original.role) : "—"),
    },
    {
      accessorKey: "records_added",
      header: "سجلات مضافة",
      cell: ({ row }) => formatNumber(row.original.records_added ?? 0),
    },
    {
      accessorKey: "edits_made",
      header: "تعديلات",
      cell: ({ row }) => formatNumber(row.original.edits_made ?? 0),
    },
    {
      accessorKey: "cities_touched",
      header: "الجمعيات",
      cell: ({ row }) => formatNumber(row.original.cities_touched ?? 0),
    },
    {
      accessorKey: "approval_rate",
      header: "نسبة القبول",
      cell: ({ row }) => `${row.original.approval_rate ?? 0}%`,
    },
    {
      accessorKey: "last_active_at",
      header: "آخر نشاط",
      cell: ({ row }) => (row.original.last_active_at ? formatDate(row.original.last_active_at) : "—"),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      isLoading={isLoading}
      error={error ? "تعذر تحميل نشاط الفريق" : undefined}
      onRetry={() => refetch()}
      emptyTitle="لا يوجد نشاط بعد"
    />
  );
}
