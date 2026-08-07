"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCityStatusBreakdown } from "@/features/analytics/hooks/use-city-analytics";
import { formatNumber } from "@/lib/format";

/** Same original/modified/added color language as ProvenanceBadge, kept as one taxonomy across
 *  the Holdings table and this summary card. */
const SEGMENT_STYLES = {
  original: "bg-muted-foreground/40",
  modified: "bg-amber-500",
  added: "bg-blue-500",
} as const;

function ProportionBar({ original, modified, added, total }: { original: number; modified: number; added: number; total: number }) {
  if (total === 0) {
    return <div className="h-3 w-full rounded-full bg-muted" />;
  }
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted" role="img" aria-label="توزيع الحيازات حسب المصدر">
      {original > 0 ? (
        <div className={SEGMENT_STYLES.original} style={{ width: `${(original / total) * 100}%` }} />
      ) : null}
      {modified > 0 ? (
        <div className={SEGMENT_STYLES.modified} style={{ width: `${(modified / total) * 100}%` }} />
      ) : null}
      {added > 0 ? (
        <div className={SEGMENT_STYLES.added} style={{ width: `${(added / total) * 100}%` }} />
      ) : null}
    </div>
  );
}

function LegendItem({ colorClass, label, count, total }: { colorClass: string; label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`size-2.5 shrink-0 rounded-full ${colorClass}`} />
      <span className="text-muted-foreground">{label}</span>
      <span className="ms-auto font-medium">
        {formatNumber(count)} <span className="text-muted-foreground">({pct}%)</span>
      </span>
    </div>
  );
}

/**
 * City Overview — parcel provenance breakdown (original/modified/added) and person-level status,
 * server-aggregated via city_status_breakdown rather than fetched row-by-row. Reuses
 * ProvenanceBadge's exact color taxonomy so this reads as the same concept, not a new one.
 */
export function CityStatusBoard({ cityId }: { cityId: string }) {
  const { data, isLoading } = useCityStatusBreakdown(cityId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>حالة البيانات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const original = data?.original_count ?? 0;
  const modified = data?.modified_count ?? 0;
  const added = data?.added_count ?? 0;
  const total = data?.total_holdings ?? 0;
  const totalPersons = data?.total_persons ?? 0;
  const personsWithAdded = data?.persons_with_added_parcel ?? 0;
  const personsWithModified = data?.persons_with_modified_parcel ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>حالة البيانات</CardTitle>
        <CardDescription>توزيع الحيازات حسب المصدر، وحالة الأشخاص المرتبطين بها</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">الحيازات ({formatNumber(total)})</p>
          <ProportionBar original={original} modified={modified} added={added} total={total} />
          <div className="grid gap-2 sm:grid-cols-3">
            <LegendItem colorClass={SEGMENT_STYLES.original} label="أصلية" count={original} total={total} />
            <LegendItem colorClass={SEGMENT_STYLES.modified} label="مُعدَّلة" count={modified} total={total} />
            <LegendItem colorClass={SEGMENT_STYLES.added} label="مُضافة" count={added} total={total} />
          </div>
        </div>

        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-sm font-medium text-muted-foreground">الأشخاص ({formatNumber(totalPersons)})</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <LegendItem
              colorClass={SEGMENT_STYLES.added}
              label="لديهم حيازة مُضافة"
              count={personsWithAdded}
              total={totalPersons}
            />
            <LegendItem
              colorClass={SEGMENT_STYLES.modified}
              label="لديهم حيازة مُعدَّلة"
              count={personsWithModified}
              total={totalPersons}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
