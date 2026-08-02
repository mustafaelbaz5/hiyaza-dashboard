"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
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
import { cityEditSchema, type CityEditInput } from "../schemas/city-schema";
import { useUpdateCity } from "../hooks/use-city-mutations";
import { AssociationTypeFields } from "./association-type-fields";
import type { City } from "../types";

function defaultsFor(city: City): CityEditInput {
  return {
    name: city.name,
    administration: city.administration ?? "",
    directorate: city.directorate ?? "",
    associationType: city.associationType ?? "",
    associationSubtype: city.associationSubtype ?? "",
  };
}

/** Edit an existing city's name, administration/directorate, and association type/subtype. */
export function EditCityDialog({ city }: { city: City }) {
  const [open, setOpen] = useState(false);
  const updateCity = useUpdateCity(city.id);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CityEditInput>({ resolver: zodResolver(cityEditSchema), defaultValues: defaultsFor(city) });

  const associationType = watch("associationType");

  useEffect(() => {
    if (open) reset(defaultsFor(city));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function onSubmit(values: CityEditInput) {
    updateCity.mutate(
      {
        name: values.name,
        administration: values.administration || undefined,
        directorate: values.directorate || undefined,
        associationType: values.associationType || null,
        associationSubtype: values.associationSubtype || null,
      },
      {
        onSuccess: () => {
          toast.success("تم حفظ التعديلات");
          setOpen(false);
        },
        onError: (error) => {
          if (error.code === "conflict") {
            toast.error("الاسم مستخدم بالفعل");
            return;
          }
          toast.error(error.message || "تعذر حفظ التعديلات");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Pencil />
          تعديل
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تعديل بيانات الجمعية</DialogTitle>
          <DialogDescription>
            لن يتم تحديث اسم الجمعية في السجلات المستوردة سابقًا — الاسم الجديد يظهر في الواجهة فقط.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="edit-name">اسم الجمعية</Label>
            <Input id="edit-name" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-administration">الإدارة</Label>
            <Input id="edit-administration" {...register("administration")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-directorate">المديرية</Label>
            <Input id="edit-directorate" {...register("directorate")} />
          </div>
          <AssociationTypeFields
            control={control}
            errors={errors}
            associationType={associationType}
            setValue={setValue}
          />
          <DialogFooter>
            <Button type="submit" disabled={updateCity.isPending}>
              {updateCity.isPending ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
