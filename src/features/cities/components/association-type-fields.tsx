import { Controller, type Control, type FieldErrors, type Path, type UseFormSetValue } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ASSOCIATION_SUBTYPES, ASSOCIATION_TYPE, ASSOCIATION_TYPE_LABELS } from "@/lib/constants";

const ASSOCIATION_TYPE_OPTIONS = [
  ASSOCIATION_TYPE.agriculturalCredit,
  ASSOCIATION_TYPE.agriculturalReform,
] as const;

/** Field shape shared by CityFormInput (create) and CityEditInput (edit) — both schemas match this. */
interface AssociationTypeFormValues {
  associationType?: string;
  associationSubtype?: string;
}

interface AssociationTypeFieldsProps<T extends AssociationTypeFormValues> {
  control: Control<T>;
  errors: FieldErrors<T>;
  associationType: T["associationType"];
  setValue: UseFormSetValue<T>;
}

/**
 * The type <Select> + conditional subtype <Select> pair, shared by the create and edit city
 * dialogs so this logic (and the Arabic labels/values) lives in exactly one place.
 */
export function AssociationTypeFields<T extends AssociationTypeFormValues>({
  control,
  errors,
  associationType,
  setValue,
}: AssociationTypeFieldsProps<T>) {
  const subtypeOptions =
    associationType && associationType in ASSOCIATION_SUBTYPES
      ? ASSOCIATION_SUBTYPES[associationType as keyof typeof ASSOCIATION_SUBTYPES]
      : [];

  return (
    <>
      <div className="space-y-2">
        <Label>نوع الجمعية</Label>
        <Controller
          control={control}
          name={"associationType" as Path<T>}
          render={({ field }) => (
            <Select
              value={(field.value as string) || undefined}
              onValueChange={(value) => {
                field.onChange(value);
                setValue("associationSubtype" as Path<T>, "" as never);
              }}
            >
              <SelectTrigger className="w-full" aria-label="نوع الجمعية">
                <SelectValue placeholder="غير محدد" />
              </SelectTrigger>
              <SelectContent>
                {ASSOCIATION_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type} value={type}>
                    {ASSOCIATION_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      {associationType ? (
        <div className="space-y-2">
          <Label>
            {associationType === ASSOCIATION_TYPE.agriculturalCredit ? "نوع الائتمان" : "نوع الإصلاح"}
          </Label>
          <Controller
            control={control}
            name={"associationSubtype" as Path<T>}
            render={({ field }) => (
              <Select value={(field.value as string) || undefined} onValueChange={field.onChange}>
                <SelectTrigger className="w-full" aria-label="النوع الفرعي">
                  <SelectValue placeholder="غير محدد" />
                </SelectTrigger>
                <SelectContent>
                  {subtypeOptions.map((subtype) => (
                    <SelectItem key={subtype} value={subtype}>
                      {subtype}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.associationSubtype ? (
            <p className="text-sm text-destructive">
              {(errors.associationSubtype as { message?: string }).message}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
