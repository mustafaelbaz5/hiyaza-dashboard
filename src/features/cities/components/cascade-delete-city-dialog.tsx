"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
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
import { useDeleteCityCascade } from "../hooks/use-city-mutations";
import type { CityWithStats } from "../types";

interface CascadeDeleteCityDialogProps {
  city: CityWithStats;
  redirectOnSuccess?: boolean;
}

/**
 * Permanently deletes a city AND every holding, added holding, holding edit, and import batch
 * under it — unlike DeleteCityDialog, this never refuses. Deliberately a separate, harder-to-
 * trigger component (type the city name to confirm) since its blast radius is unbounded, rather
 * than a variant of the safe delete dialog whose copy promises automatic rejection.
 */
export function CascadeDeleteCityDialog({ city, redirectOnSuccess }: CascadeDeleteCityDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const deleteCascade = useDeleteCityCascade();
  const router = useRouter();

  const canConfirm = confirmText.trim() === city.name;

  function handleDelete() {
    if (!canConfirm) return;
    deleteCascade.mutate(city.id, {
      onSuccess: () => {
        toast.success("تم حذف الجمعية وكل بياناتها نهائيًا");
        setOpen(false);
        setConfirmText("");
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setConfirmText("");
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
          <Trash2 />
          حذف مع البيانات
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>حذف &quot;{city.name}&quot; وكل بياناتها نهائيًا؟</DialogTitle>
          <DialogDescription>
            هذا الإجراء لا يمكن التراجع عنه. سيتم حذف {city.holdingsCount.toLocaleString("ar-EG")} حيازة
            وكل سجلات الاستيراد والتعديلات المرتبطة بهذه الجمعية نهائيًا.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="confirm-city-name">
            اكتب <span className="font-semibold">{city.name}</span> للتأكيد
          </Label>
          <Input
            id="confirm-city-name"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button
            onClick={handleDelete}
            disabled={!canConfirm || deleteCascade.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteCascade.isPending ? "جاري الحذف..." : "حذف نهائي"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
