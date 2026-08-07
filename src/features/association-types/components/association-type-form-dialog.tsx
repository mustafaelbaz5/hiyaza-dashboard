"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
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
import { useCreateAssociationType, useUpdateAssociationType } from "../hooks/use-association-type-mutations";
import type { AssociationTypeOption } from "../types";

interface FormValues {
  code: string;
  labelAr: string;
  labelEn: string;
  sortOrder: string;
}

/**
 * Create-or-edit dialog for one association type. In edit mode `code` is fixed (it's the FK target
 * every city.association_type_code points at) — only the labels and sort order can change.
 */
export function AssociationTypeFormDialog({ existing }: { existing?: AssociationTypeOption }) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(existing);
  const createType = useCreateAssociationType();
  const updateType = useUpdateAssociationType(existing?.code ?? "");
  const isPending = createType.isPending || updateType.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      code: existing?.code ?? "",
      labelAr: existing?.labelAr ?? "",
      labelEn: existing?.labelEn ?? "",
      sortOrder: String(existing?.sortOrder ?? 0),
    },
  });

  function onSubmit(values: FormValues) {
    const sortOrder = Number(values.sortOrder) || 0;

    if (isEdit) {
      updateType.mutate(
        { labelAr: values.labelAr, labelEn: values.labelEn || null, sortOrder },
        {
          onSuccess: () => {
            toast.success("تم تحديث نوع الجمعية");
            setOpen(false);
          },
          onError: () => toast.error("تعذر تحديث نوع الجمعية"),
        },
      );
      return;
    }

    createType.mutate(
      { code: values.code, labelAr: values.labelAr, labelEn: values.labelEn || null, sortOrder },
      {
        onSuccess: () => {
          toast.success("تم إنشاء نوع الجمعية");
          reset();
          setOpen(false);
        },
        onError: () => toast.error("تعذر إنشاء نوع الجمعية — تأكد أن الكود غير مستخدم"),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button size="sm" variant="ghost">
            <Pencil />
          </Button>
        ) : (
          <Button>
            <Plus />
            إضافة نوع جمعية
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل نوع الجمعية" : "إضافة نوع جمعية جديد"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "الكود ثابت بعد الإنشاء — التسميات وترتيب العرض فقط قابلة للتعديل."
              : "النوع الجديد يصبح متاحًا فورًا عند إنشاء أو تعديل أي جمعية، بدون الحاجة لنشر تحديث."}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="code">الكود (بالإنجليزية، فريد)</Label>
            <Input
              id="code"
              dir="ltr"
              disabled={isEdit}
              {...register("code", { required: !isEdit })}
            />
            {errors.code ? <p className="text-sm text-destructive">هذا الحقل مطلوب</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="labelAr">التسمية بالعربية</Label>
            <Input id="labelAr" {...register("labelAr", { required: true })} />
            {errors.labelAr ? <p className="text-sm text-destructive">هذا الحقل مطلوب</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="labelEn">التسمية بالإنجليزية (اختياري)</Label>
            <Input id="labelEn" dir="ltr" {...register("labelEn")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">ترتيب العرض</Label>
            <Input id="sortOrder" type="number" {...register("sortOrder")} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "جارٍ الحفظ..." : isEdit ? "حفظ" : "إنشاء"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
