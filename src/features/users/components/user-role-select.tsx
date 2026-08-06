"use client";

import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSetUserRole } from "../hooks/use-user-mutations";
import type { AppRole, DashboardUser } from "../types";

const ROLE_LABELS: Record<AppRole, string> = {
  admin: "مدير",
  editor: "محرر",
  viewer: "مشاهد",
  field: "ميداني",
};

const ASSIGNABLE_ROLES = ["admin", "editor", "viewer"] as const;

/** Role dropdown for one user row. */
export function UserRoleSelect({ user }: { user: DashboardUser }) {
  const setRole = useSetUserRole();

  return (
    <Select
      value={user.role}
      onValueChange={(role) =>
        setRole.mutate(
          { userId: user.id, role: role as AppRole },
          { onError: () => toast.error("تعذر تغيير الدور") },
        )
      }
    >
      <SelectTrigger size="sm" className="w-28" aria-label={`دور ${user.displayName}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ASSIGNABLE_ROLES.map((r) => (
          <SelectItem key={r} value={r}>
            {ROLE_LABELS[r]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
