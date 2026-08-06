"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatRoundedNumber } from "@/lib/format";
import type { BasinBreakdown } from "../types";

const chartConfig = {
  total_feddan: {
    label: "إجمالي المساحة (فدان)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

/**
 * Basin breakdown as a magnitude comparison — sequential single-hue bars, sorted
 * descending, so the reader's eye reads "biggest basin first" without needing a
 * legend (one series = no legend box, per dataviz skill's form rules).
 */
export function BasinBreakdownChart({ basins }: { basins: BasinBreakdown[] }) {
  if (basins.length === 0) {
    return <EmptyState title="لا توجد بيانات أحواض" />;
  }

  const sorted = [...basins].sort((a, b) => (b.total_feddan ?? 0) - (a.total_feddan ?? 0)).slice(0, 15);

  return (
    <Card>
      <CardHeader>
        <CardTitle>توزيع الأحواض حسب المساحة</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[max(300px,_theme(spacing.10)*var(--rows))]" style={{ "--rows": sorted.length } as React.CSSProperties}>
          <BarChart data={sorted} layout="vertical" margin={{ right: 48 }}>
            <CartesianGrid horizontal={false} stroke="var(--border)" strokeOpacity={0.5} />
            <XAxis type="number" tickFormatter={(v: number) => formatRoundedNumber(v)} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="basin_name"
              tickLine={false}
              axisLine={false}
              width={100}
              tick={{ fill: "var(--muted-foreground)" }}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", opacity: 0.3 }}
              content={
                <ChartTooltipContent
                  formatter={(value, _name, item) => (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground">
                        {formatRoundedNumber(value as number)} فدان
                      </span>
                      <span className="text-muted-foreground">
                        {formatRoundedNumber((item.payload as BasinBreakdown).holdings_count)} حيازة
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey="total_feddan" fill="var(--color-total_feddan)" radius={4} barSize={20}>
              <LabelList
                dataKey="total_feddan"
                position="right"
                className="fill-foreground"
                fontSize={12}
                formatter={(v) => (v === null || v === undefined ? "" : formatRoundedNumber(Number(v)))}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
