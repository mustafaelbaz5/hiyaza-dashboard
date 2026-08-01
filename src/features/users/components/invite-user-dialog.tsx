"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteFormSchema, type InviteFormInput } from "../schemas/invite-schema";
import { useInviteUser } from "../hooks/use-user-mutations";

const ROLE_OPTIONS = [
  { value: "viewer", label: "مشاهد" },
  { value: "editor", label: "محرر" },
  { value: "admin", label: "مدير" },
] as const;

/** Admin-only: invite a new dashboard user by email via the Auth Admin API. */
export function InviteUserDialog() {
  const [open, setOpen] = useState(false);
  const invite = useInviteUser();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormInput>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: { role: "viewer" },
  });

  function onSubmit(values: InviteFormInput) {
    invite.mutate(values, {
      onSuccess: () => {
        toast.success("تم إرسال الدعوة");
        reset();
        setOpen(false);
      },
      onError: () => toast.error("تعذر إرسال الدعوة"),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus />
          دعوة مستخدم
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>دعوة مستخدم جديد</DialogTitle>
          <DialogDescription>سيتلقى المستخدم بريدًا إلكترونيًا لتفعيل الحساب.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="displayName">الاسم</Label>
            <Input id="displayName" {...register("displayName")} />
            {errors.displayName ? (
              <p className="text-sm text-destructive">{errors.displayName.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>الدور</Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={invite.isPending}>
              {invite.isPending ? "جاري الإرسال..." : "إرسال الدعوة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
