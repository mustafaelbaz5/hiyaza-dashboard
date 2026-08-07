"use client";

import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { QUALITY_RULES } from "../registry/quality-rules";
import { useQualityData, useCaptureQualitySnapshot } from "../hooks/use-quality";
import { useCities } from "@/features/cities/hooks/use-cities";
import { QualityIssueDrilldown } from "./quality-issue-drilldown";
import { formatNumber } from "@/lib/format";
import { Camera } from "lucide-react";

const COMPLETENESS_FIELDS = [
  { key: "national_id_pct", label: "الرقم القومي" },
  { key: "basin_code_pct", label: "كود الحوض" },
  { key: "area_pct", label: "المساحة" },
  { key: "unified_number_pct", label: "الرقم الموحد" },
  { key: "holder_name_pct", label: "اسم الحائز" },
] as const;

function completenessColor(pct: number) {
  if (pct >= 90) return "bg-primary/20 text-primary";
  if (pct >= 50) return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
  return "bg-destructive/20 text-destructive";
}

/** Board 3 — completeness heatmap + rule-based issue counts, optionally scoped to one city. */
export function QualityBoard({ cityId }: { cityId?: string }) {
  const { completeness, issues } = useQualityData(cityId);
  const captureSnapshot = useCaptureQualitySnapshot(cityId ?? "");
  const { data: cities } = useCities();

  const rows = completeness.data ?? [];
  const issueRows = issues.data ?? [];
  const cityName = (id: string | null) =>
    cities?.find((c) => c.id === id)?.name ?? id?.slice(0, 8) ?? "—";

  if (rows.length === 0 && !completeness.isLoading) {
    return <EmptyState title="لا توجد بيانات لتقييم الجودة" description="استورد بيانات جمعية أولاً" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>مصفوفة اكتمال البيانات</CardTitle>
          {cityId ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                captureSnapshot.mutate(undefined, {
                  onSuccess: () => toast.success("تم حفظ لقطة الجودة"),
                  onError: () => toast.error("تعذر حفظ لقطة الجودة"),
                })
              }
              disabled={captureSnapshot.isPending}
            >
              <Camera />
              حفظ لقطة
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-start text-muted-foreground">
                <th className="p-2 text-start">الجمعية</th>
                {COMPLETENESS_FIELDS.map((f) => (
                  <th key={f.key} className="p-2 text-start">{f.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.city_id} className="border-t border-border">
                  <td className="p-2 font-medium">{cityName(row.city_id)}</td>
                  {COMPLETENESS_FIELDS.map((f) => {
                    const pct = row[f.key] ?? 0;
                    return (
                      <td key={f.key} className="p-2">
                        <Badge className={completenessColor(pct)}>{pct}%</Badge>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>المشكلات المكتشفة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {issueRows.map((row) => (
            <div key={row.city_id} className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{cityName(row.city_id)}</p>
              {cityId && row.city_id ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {QUALITY_RULES.map((rule) => {
                    const count = row[rule.key] ?? 0;
                    if (!count) return null;
                    return (
                      <QualityIssueDrilldown
                        key={rule.key}
                        cityId={row.city_id as string}
                        rule={rule}
                        count={count}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {QUALITY_RULES.map((rule) => {
                    const count = row[rule.key] ?? 0;
                    if (!count) return null;
                    return (
                      <Badge
                        key={rule.key}
                        variant={rule.severity === "error" ? "destructive" : "secondary"}
                      >
                        {rule.label}: {formatNumber(count)}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
