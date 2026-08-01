"use client";

import { Building2, Users, ClipboardList, Landmark } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { ErrorState } from "@/components/shared/error-state";
import { useSystemOverview } from "../hooks/use-system-overview";
import { formatNumber, formatRoundedNumber } from "@/lib/format";

/** Board 1 — system overview, all counts sourced from the system_overview view (no client aggregation). */
export function SystemOverviewBoard() {
  const { data, isLoading, error, refetch } = useSystemOverview();

  if (error) {
    return <ErrorState message="تعذر تحميل النظرة العامة" onRetry={() => refetch()} />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="إجمالي الجمعيات"
        value={data ? formatNumber(data.total_cities ?? 0) : "0"}
        icon={Building2}
        isLoading={isLoading}
        trend={
          data
            ? {
                direction: "flat",
                value: `${formatNumber(data.published_cities ?? 0)} منشورة، ${formatNumber(data.draft_cities ?? 0)} مسودة`,
              }
            : undefined
        }
      />
      <StatCard
        label="إجمالي الحيازات"
        value={data ? formatNumber(data.total_holdings ?? 0) : "0"}
        icon={Landmark}
        isLoading={isLoading}
      />
      <StatCard
        label="عدد الأشخاص المميزين"
        value={data ? formatNumber(data.total_distinct_people ?? 0) : "0"}
        icon={Users}
        isLoading={isLoading}
      />
      <StatCard
        label="مراجعات بانتظار الرد"
        value={data ? formatNumber(data.pending_reviews ?? 0) : "0"}
        icon={ClipboardList}
        isLoading={isLoading}
      />
      <StatCard
        label="إجمالي المساحة (فدان)"
        value={data ? formatRoundedNumber(data.total_feddan) : "0"}
        isLoading={isLoading}
      />
      <StatCard
        label="جمعيات لم تُستورد بعد"
        value={data ? formatNumber(data.cities_never_imported ?? 0) : "0"}
        isLoading={isLoading}
      />
      <StatCard
        label="جمعيات بلا تحديث منذ 90 يومًا"
        value={data ? formatNumber(data.cities_stale_90d ?? 0) : "0"}
        isLoading={isLoading}
      />
      <StatCard
        label="مستخدمون نشطون (7 أيام)"
        value={data ? formatNumber(data.active_users_7d ?? 0) : "0"}
        isLoading={isLoading}
      />
    </div>
  );
}
