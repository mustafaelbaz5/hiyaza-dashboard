"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { Plus } from "lucide-react";
import { cityFormSchema, type CityFormInput } from "../schemas/city-schema";
import { useCreateCity } from "../hooks/use-city-mutations";
import { AssociationTypeFields } from "./association-type-fields";
import { useState } from "react";

/** Create-city dialog, opened from the cities list PageHeader action. */
export function CityFormDialog() {
  const [open, setOpen] = useState(false);
  const createCity = useCreateCity();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CityFormInput>({ resolver: zodResolver(cityFormSchema) });

  const associationType = watch("associationType");

  function onSubmit(values: CityFormInput) {
    createCity.mutate(
      {
        ...values,
        associationType: values.associationType || null,
        associationSubtype: values.associationSubtype || null,
      },
      {
        onSuccess: () => {
          toast.success("تم إنشاء الجمعية بنجاح");
          reset();
          setOpen(false);
        },
        onError: () => toast.error("تعذر إنشاء الجمعية"),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          إضافة جمعية
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة جمعية جديدة</DialogTitle>
          <DialogDescription>الجمعية تُنشأ كمسودة ولا تظهر للتطبيق حتى نشرها.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">اسم الجمعية</Label>
            <Input id="name" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="administration">الإدارة</Label>
            <Input id="administration" {...register("administration")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="directorate">المديرية</Label>
            <Input id="directorate" {...register("directorate")} />
          </div>
          <AssociationTypeFields
            control={control}
            errors={errors}
            associationType={associationType}
            setValue={setValue}
          />
          <DialogFooter>
            <Button type="submit" disabled={createCity.isPending}>
              {createCity.isPending ? "جاري الإنشاء..." : "إنشاء"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
