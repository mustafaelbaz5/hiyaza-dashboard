"use client";

import { toast } from "sonner";
import { LogOut, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useForceSignOut, useSendPasswordReset } from "../hooks/use-user-mutations";
import type { DashboardUser } from "../types";

/** Password reset / force sign-out actions for one user row, plus the disabled badge. */
export function UserRowActions({ user }: { user: DashboardUser }) {
  const forceSignOut = useForceSignOut();
  const sendPasswordReset = useSendPasswordReset();

  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        title="إعادة تعيين كلمة المرور"
        aria-label="إعادة تعيين كلمة المرور"
        onClick={() =>
          sendPasswordReset.mutate(user.email, {
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
          forceSignOut.mutate(user.id, {
            onSuccess: () => toast.success("تم تسجيل الخروج من كل الجلسات"),
            onError: () => toast.error("تعذر تسجيل الخروج"),
          })
        }
      >
        <LogOut className="size-4" />
      </Button>
      {!user.isActive ? <Badge variant="secondary">معطّل</Badge> : null}
    </div>
  );
}
