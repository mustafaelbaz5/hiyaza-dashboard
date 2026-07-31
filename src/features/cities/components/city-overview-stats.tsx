"use client";

import { Building2, Upload } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { ErrorState } from "@/components/shared/error-state";
import { useCity } from "../hooks/use-city";

function formatDate(value: string | null | undefined) {
  if (!value) return "لم يتم الاستيراد بعد";
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(value));
}

/**
 * City overview stat tiles. Keeps to what's cheaply queryable from `cities`/`holdings` directly —
 * the full analytics RPCs (area totals, basin breakdown, top holders) land in Phase 5 alongside
 * the quality_snapshots migration, per DASHBOARD_PLAN.md § 6.7.
 */
export function CityOverviewStats({ cityId }: { cityId: string }) {
  const { data: city, isLoading, error, refetch } = useCity(cityId);

  if (error) {
    return <ErrorState message="تعذر تحميل إحصائيات الجمعية" onRetry={() => refetch()} />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <StatCard
        label="حالة البيانات"
        value={city ? `الإصدار ${city.dataVersion}` : "—"}
        icon={Building2}
        isLoading={isLoading}
      />
      <StatCard
        label="تاريخ آخر تحديث"
        value={formatDate(city?.updatedAt)}
        icon={Upload}
        isLoading={isLoading}
      />
    </div>
  );
}
