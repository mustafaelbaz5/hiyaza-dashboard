"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQualityIssueHoldings } from "../hooks/use-quality";
import type { QualityRule } from "../registry/quality-rules";
import type { QualityIssues } from "../types";

/**
 * One expandable issue badge — clicking it fetches and lists the actual holdings behind the
 * count, each linking to its Holding Details page, so an admin can act on a quality problem
 * instead of just knowing a number exists.
 */
export function QualityIssueDrilldown({
  cityId,
  rule,
  count,
}: {
  cityId: string;
  rule: QualityRule;
  count: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading } = useQualityIssueHoldings(
    cityId,
    rule.key as keyof Omit<QualityIssues, "city_id">,
    expanded,
  );

  return (
    <div className="rounded-md border border-border">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-2 p-2 text-start"
      >
        <Badge variant={rule.severity === "error" ? "destructive" : "secondary"}>
          {rule.label}: {count}
        </Badge>
        {expanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
      </button>
      {expanded ? (
        <div className="border-t border-border p-2">
          {isLoading ? (
            <div className="space-y-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : !data || data.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد حيازات متأثرة حاليًا</p>
          ) : (
            <div className="space-y-1">
              {data.map((h) => (
                <div key={h.id} className="flex items-center justify-between text-sm">
                  <span>
                    {h.holdingIdNumber ?? "—"} — {h.holderName ?? "بدون اسم"}
                  </span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/cities/${cityId}/holdings/${h.id}`}>عرض التفاصيل</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
