import { Controller, type Control, type FieldErrors, type UseFormSetValue } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ASSOCIATION_SUBTYPES, ASSOCIATION_TYPE, ASSOCIATION_TYPE_LABELS } from "@/lib/constants";
import type { CityEditInput } from "../schemas/city-schema";

const ASSOCIATION_TYPE_OPTIONS = [
  ASSOCIATION_TYPE.agriculturalCredit,
  ASSOCIATION_TYPE.agriculturalReform,
] as const;

interface AssociationTypeFieldsProps {
  control: Control<CityEditInput>;
  errors: FieldErrors<CityEditInput>;
  associationType: CityEditInput["associationType"];
  setValue: UseFormSetValue<CityEditInput>;
}

/** The type <Select> + conditional subtype <Select> pair, extracted so EditCityDialog stays readable. */
export function AssociationTypeFields({
  control,
  errors,
  associationType,
  setValue,
}: AssociationTypeFieldsProps) {
  const subtypeOptions = associationType ? ASSOCIATION_SUBTYPES[associationType] : [];

  return (
    <>
      <div className="space-y-2">
        <Label>نوع الجمعية</Label>
        <Controller
          control={control}
          name="associationType"
          render={({ field }) => (
            <Select
              value={field.value || undefined}
              onValueChange={(value) => {
                field.onChange(value);
                setValue("associationSubtype", "");
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
            name="associationSubtype"
            render={({ field }) => (
              <Select value={field.value || undefined} onValueChange={field.onChange}>
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
            <p className="text-sm text-destructive">{errors.associationSubtype.message}</p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
