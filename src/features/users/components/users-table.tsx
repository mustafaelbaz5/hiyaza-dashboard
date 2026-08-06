"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { LogOut, Mail } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers } from "../hooks/use-users";
import {
  useSetUserRole,
  useSetUserActive,
  useForceSignOut,
  useSendPasswordReset,
} from "../hooks/use-user-mutations";
import { useTeamActivity } from "@/features/analytics/hooks/use-team-activity";
import { formatDate, formatNumber } from "@/lib/format";
import type { AppRole, DashboardUser } from "../types";

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "مدير",
  editor: "محرر",
  viewer: "مشاهد",
  field: "ميداني",
};

/** Admin-only users table: role changes, enable/disable, force sign-out, password reset. */
export function UsersTable() {
  const { data, isLoading, error, refetch } = useUsers();
  const { data: teamActivity } = useTeamActivity();
  const setRole = useSetUserRole();
  const setActive = useSetUserActive();
  const forceSignOut = useForceSignOut();
  const sendPasswordReset = useSendPasswordReset();
  const rows = useMemo(() => data ?? [], [data]);
  const activityByUserId = useMemo(() => {
    const map = new Map<string, NonNullable<typeof teamActivity>[number]>();
    for (const row of teamActivity ?? []) {
      if (row.user_id) map.set(row.user_id, row);
    }
    return map;
  }, [teamActivity]);

  const columns: ColumnDef<DashboardUser>[] = [
    { accessorKey: "displayName", header: "الاسم" },
    { accessorKey: "email", header: "البريد الإلكتروني" },
    {
      accessorKey: "role",
      header: "الدور",
      cell: ({ row }) => (
        <Select
          value={row.original.role}
          onValueChange={(role) =>
            setRole.mutate(
              { userId: row.original.id, role: role as AppRole },
              { onError: () => toast.error("تعذر تغيير الدور") },
            )
          }
        >
          <SelectTrigger size="sm" className="w-28" aria-label={`دور ${row.original.displayName}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["admin", "editor", "viewer"] as const).map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      accessorKey: "isActive",
      header: "مفعّل",
      cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onCheckedChange={(checked) =>
            setActive.mutate(
              { userId: row.original.id, isActive: checked },
              { onError: () => toast.error("تعذر تحديث الحالة") },
            )
          }
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
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            title="إعادة تعيين كلمة المرور"
            aria-label="إعادة تعيين كلمة المرور"
            onClick={() =>
              sendPasswordReset.mutate(row.original.email, {
                onSuccess: () => toast.success("تم إرسال رابط إعادة التعيين"),
                onError: () => toast.error("تعذر إرسال الرابط"),
              })
            }
          >
            <Mail className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            title="تسجيل خروج إجباري"
            aria-label="تسجيل خروج إجباري"
            onClick={() =>
              forceSignOut.mutate(row.original.id, {
                onSuccess: () => toast.success("تم تسجيل الخروج من كل الجلسات"),
                onError: () => toast.error("تعذر تسجيل الخروج"),
              })
            }
          >
            <LogOut className="size-4" />
          </Button>
          {!row.original.isActive ? <Badge variant="secondary">معطّل</Badge> : null}
        </div>
      ),
    },
  ];

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
