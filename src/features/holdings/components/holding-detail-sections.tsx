import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AssociationType } from "@/features/cities/types";
import type { MergedHolding } from "../core/merge-holding";

interface DetailField {
  label: string;
  value: string;
}

/**
 * Association-type-conditional section registry — Credit vs. Reform cities show different
 * holding fields (per SYSTEM_DESIGN.md § 3, a registry is justified here because this is a
 * second real variation, alongside the association-type fields already registry-driven in
 * src/features/cities/components/association-type-fields.tsx).
 *
 * `holdings`/`added_holdings` carry both credit_type and reform_type columns regardless of the
 * owning city's association_type (the DB doesn't branch storage by type), so this registry only
 * controls which of those columns is surfaced to the admin, not where the data lives.
 */
const ASSOCIATION_TYPE_SECTION_TITLES: Record<AssociationType, string> = {
  agricultural_credit: "بيانات الائتمان",
  agricultural_reform: "بيانات الإصلاح",
};

function buildAssociationTypeFields(
  holding: MergedHolding,
  associationType: AssociationType,
): DetailField[] {
  if (associationType === "agricultural_credit") {
    return [{ label: "نوع الائتمان", value: holding.credit_type ?? "—" }];
  }
  return [{ label: "نوع الإصلاح", value: holding.reform_type ?? "—" }];
}

/** The association-type-specific section — title and fields both vary by cities.association_type. */
export function AssociationTypeSection({
  holding,
  associationType,
}: {
  holding: MergedHolding;
  associationType: AssociationType | null;
}) {
  if (!associationType) return null;

  const fields = buildAssociationTypeFields(holding, associationType);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{ASSOCIATION_TYPE_SECTION_TITLES[associationType]}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {fields.map((field) => (
          <div key={field.label} className="space-y-1">
            <p className="text-xs text-muted-foreground">{field.label}</p>
            <p className="text-sm font-medium">{field.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
