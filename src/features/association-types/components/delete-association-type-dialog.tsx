"use client";

import { useState } from "react";
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
import { useDeleteAssociationType } from "../hooks/use-association-type-mutations";
import type { AssociationTypeOption } from "../types";

/**
 * Permanent delete — the database refuses this (foreign key restrict on
 * cities.association_type_code) if any city currently uses this type, so this can never orphan
 * a city's type reference.
 */
export function DeleteAssociationTypeDialog({ type }: { type: AssociationTypeOption }) {
  const [open, setOpen] = useState(false);
  const deleteType = useDeleteAssociationType();

  function handleDelete() {
    deleteType.mutate(type.code, {
      onSuccess: () => {
        toast.success("تم حذف نوع الجمعية");
        setOpen(false);
      },
      onError: (error) => {
        const message =
          error && typeof error === "object" && "message" in error
            ? (error as { message: string }).message
            : "تعذر حذف نوع الجمعية";
        toast.error(message);
      },
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>حذف &quot;{type.labelAr}&quot;؟</AlertDialogTitle>
          <AlertDialogDescription>
            لا يمكن التراجع عن هذا الإجراء. إذا كانت أي جمعية تستخدم هذا النوع حاليًا، سيتم رفض
            الحذف تلقائيًا.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteType.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteType.isPending ? "جاري الحذف..." : "حذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
