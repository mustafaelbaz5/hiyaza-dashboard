"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { useHolding } from "../hooks/use-holding";
import { useCity } from "@/features/cities/hooks/use-city";
import { ProvenanceBadge } from "./provenance-badge";
import { AssociationTypeSection } from "./holding-detail-sections";
import { FIELD_LABELS, type EditableField } from "../core/editable-fields";

const IDENTITY_FIELDS: EditableField[] = ["holder_name", "national_id"];
const LOCATION_FIELDS: EditableField[] = [
  "basin_name",
  "basin_code",
  "association_name",
  "administration",
  "directorate",
  "land_number",
  "page_number",
];
const BORDER_FIELDS: EditableField[] = ["border_north", "border_south", "border_east", "border_west"];
const AREA_FIELDS: EditableField[] = ["feddan", "qirat", "sahm", "total_sqm"];

function fieldValue(value: string | number | null): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function FieldGroup({
  title,
  holding,
  fields,
}: {
  title: string;
  holding: { [K in EditableField]: string | number | null };
  fields: EditableField[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {fields.map((field) => (
          <div key={field} className="space-y-1">
            <p className="text-xs text-muted-foreground">{FIELD_LABELS[field]}</p>
            <p className="text-sm font-medium">{fieldValue(holding[field])}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/** Full-detail, plain-composition page for a single holding — provenance, identity, location, area, and association-type-specific fields. */
export function HoldingDetail({ holdingId, cityId }: { holdingId: string; cityId: string }) {
  const { data: holding, isLoading, error, refetch } = useHolding(holdingId);
  const { data: city } = useCity(cityId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message="تعذر تحميل بيانات الحيازة" onRetry={() => refetch()} />;
  }

  if (!holding) {
    return <EmptyState title="لم يتم العثور على الحيازة" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={holding.holder_name ?? "حيازة بدون اسم"}
        description={holding.holding_id_number ?? undefined}
        action={<ProvenanceBadge provenance={holding.provenance} />}
      />

      <FieldGroup title="بيانات الحائز" holding={holding} fields={IDENTITY_FIELDS} />
      <FieldGroup title="الموقع" holding={holding} fields={LOCATION_FIELDS} />
      <FieldGroup title="الحدود" holding={holding} fields={BORDER_FIELDS} />
      <FieldGroup title="المساحة" holding={holding} fields={AREA_FIELDS} />
      <AssociationTypeSection holding={holding} associationType={city?.associationType ?? null} />
    </div>
  );
}
