"use client";

import { Landmark, Upload, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { useCityDrilldown } from "@/features/analytics/hooks/use-city-analytics";
import { HoldingsTable } from "@/features/holdings/components/holdings-table";
import { formatNumber, formatRoundedNumber, formatDate } from "@/lib/format";

/**
 * City Tools — Bulk Edit is the first and primary section (REFACTOR_ROADMAP.md-adjacent UI
 * brief: "The City Tools screen should prioritize: 1. Bulk Edit, 2. City statistics, 3. Other
 * management tools"). Reuses the existing HoldingsTable (search/filter/select/bulk-edit,
 * already built and tested) rather than duplicating that logic in a second component — selecting
 * rows here and opening "تعديل جماعي" is the same flow already available from the Holdings page.
 */
export function CityToolsBoard({ cityId }: { cityId: string }) {
  const { data: drilldown, isLoading } = useCityDrilldown(cityId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>التعديل الجماعي</CardTitle>
          <CardDescription>
            حدد عدة حيازات من الجدول ثم اضغط &quot;تعديل جماعي&quot; لتطبيق قيمة واحدة على الكل
            دفعة واحدة — مع مراجعة كاملة قبل التأكيد.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HoldingsTable cityId={cityId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إحصائيات الجمعية</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
