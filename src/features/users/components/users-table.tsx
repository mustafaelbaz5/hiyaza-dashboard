"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/data-table";
import { Switch } from "@/components/ui/switch";
import { useUsers } from "../hooks/use-users";
import { useSetUserActive } from "../hooks/use-user-mutations";
import { useTeamActivity } from "@/features/analytics/hooks/use-team-activity";
import { UserRoleSelect } from "./user-role-select";
import { UserRowActions } from "./user-row-actions";
import { formatDate, formatNumber } from "@/lib/format";
import type { DashboardUser } from "../types";

type TeamActivityRow = NonNullable<ReturnType<typeof useTeamActivity>["data"]>[number];

function buildColumns(
  activityByUserId: Map<string, TeamActivityRow>,
  onToggleActive: (userId: string, isActive: boolean) => void,
): ColumnDef<DashboardUser>[] {
  return [
    { accessorKey: "displayName", header: "الاسم" },
    { accessorKey: "email", header: "البريد الإلكتروني" },
    {
      accessorKey: "role",
      header: "الدور",
      cell: ({ row }) => <UserRoleSelect user={row.original} />,
    },
    {
      accessorKey: "isActive",
      header: "مفعّل",
      cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onCheckedChange={(checked) => onToggleActive(row.original.id, checked)}
        />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "تاريخ الانضمام",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "recordsAdded",
      header: "سجلات مضافة",
      cell: ({ row }) => formatNumber(activityByUserId.get(row.original.id)?.records_added ?? 0),
    },
    {
      id: "editsMade",
      header: "تعديلات",
      cell: ({ row }) => formatNumber(activityByUserId.get(row.original.id)?.edits_made ?? 0),
    },
    {
      id: "citiesTouched",
      header: "الجمعيات",
      cell: ({ row }) => formatNumber(activityByUserId.get(row.original.id)?.cities_touched ?? 0),
    },
    {
      id: "approvalRate",
      header: "نسبة القبول",
      cell: ({ row }) => {
        const rate = activityByUserId.get(row.original.id)?.approval_rate;
        return rate === null || rate === undefined ? "—" : `${rate}%`;
      },
    },
    {
      id: "lastActiveAt",
      header: "آخر نشاط",
      cell: ({ row }) => {
        const lastActive = activityByUserId.get(row.original.id)?.last_active_at;
        return lastActive ? formatDate(lastActive) : "—";
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => <UserRowActions user={row.original} />,
    },
  ];
}

/** Admin-only users table: role changes, enable/disable, force sign-out, password reset, per-user activity. */
export function UsersTable() {
  const { data, isLoading, error, refetch } = useUsers();
  const { data: teamActivity } = useTeamActivity();
  const setActive = useSetUserActive();
  const rows = useMemo(() => data ?? [], [data]);
  const activityByUserId = useMemo(() => {
    const map = new Map<string, TeamActivityRow>();
    for (const row of teamActivity ?? []) {
      if (row.user_id) map.set(row.user_id, row);
    }
    return map;
  }, [teamActivity]);

  const onToggleActive = (userId: string, isActive: boolean) =>
    setActive.mutate({ userId, isActive }, { onError: () => toast.error("تعذر تحديث الحالة") });

  const columns = useMemo(
    () => buildColumns(activityByUserId, onToggleActive),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onToggleActive is stable across renders (closes over setActive.mutate, not state)
    [activityByUserId],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      isLoading={isLoading}
      error={error ? "تعذر تحميل المستخدمين" : undefined}
      onRetry={() => refetch()}
      emptyTitle="لا يوجد مستخدمون بعد"
      emptyDescription="ادعُ أول عضو في الفريق"
    />
  );
}
