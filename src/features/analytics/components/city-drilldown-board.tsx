"use client";

import { Landmark, Upload, Users } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { useCityDrilldown, useBasinBreakdown, useTopHolders } from "../hooks/use-city-analytics";
import { formatNumber, formatRoundedNumber, formatDate } from "@/lib/format";

/** Board 2 — per-city drilldown: headline stats, basin breakdown, top holders. */
export function CityDrilldownBoard({ cityId }: { cityId: string }) {
  const { data: drilldown, isLoading } = useCityDrilldown(cityId);
  const { data: basins } = useBasinBreakdown(cityId);
  const { data: topHolders } = useTopHolders(cityId);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="عدد الحيازات"
          value={drilldown ? formatNumber(drilldown.holdings_count) : "0"}
          icon={Landmark}
          isLoading={isLoading}
        />
        <StatCard
          label="إجمالي المساحة (فدان)"
          value={drilldown ? formatRoundedNumber(drilldown.total_feddan) : "0"}
          isLoading={isLoading}
        />
        <StatCard
          label="سجلات ميدانية"
          value={drilldown ? formatNumber(drilldown.added_holdings_count) : "0"}
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard
          label="آخر استيراد"
          value={drilldown?.last_import_at ? formatDate(drilldown.last_import_at) : "لم يستورد بعد"}
          icon={Upload}
          isLoading={isLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>توزيع الأحواض</CardTitle>
        </CardHeader>
        <CardContent>
          {!basins || basins.length === 0 ? (
            <EmptyState title="لا توجد بيانات أحواض" />
          ) : (
            <div className="space-y-2">
              {basins.map((b) => (
                <div key={b.basin_name} className="flex items-center justify-between text-sm">
                  <span>{b.basin_name}</span>
                  <span className="text-muted-foreground">
                    {formatNumber(b.holdings_count)} حيازة — {formatRoundedNumber(b.total_feddan)} فدان
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>أكبر الحائزين مساحةً</CardTitle>
        </CardHeader>
        <CardContent>
          {!topHolders || topHolders.length === 0 ? (
            <EmptyState title="لا توجد بيانات حائزين" />
          ) : (
            <div className="space-y-2">
              {topHolders.map((h, i) => (
                <div key={`${h.holder_name}-${i}`} className="flex items-center justify-between text-sm">
                  <span>{h.holder_name}</span>
                  <span className="text-muted-foreground">
                    {formatNumber(h.holdings_count)} حيازة — {formatRoundedNumber(h.total_feddan)} فدان
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
