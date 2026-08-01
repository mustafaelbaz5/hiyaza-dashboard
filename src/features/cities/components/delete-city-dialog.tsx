"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteCity } from "../hooks/use-city-mutations";
import type { City } from "../types";

interface DeleteCityDialogProps {
  city: City;
  /** Navigate to /cities after a successful delete — only needed on the city detail page. */
  redirectOnSuccess?: boolean;
}

/**
 * Permanent delete — the database itself refuses this (foreign key restrict) if the city has
 * any holdings or import history, so this can never destroy real data; it only ever removes an
 * empty/never-imported city. Archive (DASHBOARD_PLAN.md § 6.2) remains the path for real cities.
 */
export function DeleteCityDialog({ city, redirectOnSuccess }: DeleteCityDialogProps) {
  const [open, setOpen] = useState(false);
  const deleteCity = useDeleteCity();
  const router = useRouter();

  function handleDelete() {
    deleteCity.mutate(city.id, {
      onSuccess: () => {
        toast.success("تم حذف الجمعية نهائيًا");
        setOpen(false);
        if (redirectOnSuccess) router.push("/cities");
      },
      onError: (error) => {
        const message =
          error && typeof error === "object" && "message" in error
            ? (error as { message: string }).message
            : "تعذر حذف الجمعية";
        toast.error(message);
      },
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
          <Trash2 />
          حذف نهائي
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>حذف &quot;{city.name}&quot; نهائيًا؟</AlertDialogTitle>
          <AlertDialogDescription>
            لا يمكن التراجع عن هذا الإجراء. إذا كانت الجمعية تحتوي على حيازات أو سجلات استيراد،
            سيتم رفض الحذف تلقائيًا — استخدم الأرشفة بدلاً من ذلك في هذه الحالة.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteCity.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteCity.isPending ? "جاري الحذف..." : "حذف نهائي"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
