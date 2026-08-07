"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { AuditEntrySummary } from "@/features/audit/components/audit-entry-summary";
import { useAuditFeed } from "@/features/audit/hooks/use-audit-feed";
import { formatDate } from "@/lib/format";

const RECENT_LIMIT = 8;

/**
 * Compact recent-activity feed for the Overview page — the latest N audit_feed entries across
 * every city, with a link through to the full filterable Audit page. Reuses the existing
 * AuditEntrySummary presentation and useAuditFeed data source (REFACTOR_ROADMAP.md Phase 3: "Home/
 * City page statistics upgrades using existing analytics data sources").
 */
export function RecentActivityWidget() {
  const { data, isLoading, error, refetch } = useAuditFeed({});
  const entries = useMemo(() => (data ?? []).slice(0, RECENT_LIMIT), [data]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">أحدث الأنشطة</CardTitle>
        <Link href="/audit" className="text-sm text-primary hover:underline">
          عرض الكل
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message="تعذر تحميل النشاط الأخير" onRetry={() => refetch()} />
        ) : entries.length === 0 ? (
          <EmptyState title="لا يوجد نشاط بعد" />
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => {
              const key = `${entry.entityType}-${entry.entityId}`;
              return (
                <div key={key} className="flex items-center justify-between gap-2 border-b border-border pb-2 last:border-0 last:pb-0">
                  <AuditEntrySummary entry={entry} />
                  <div className="flex items-center gap-3 text-sm text-muted-foreground shrink-0">
                    <span>{entry.userDisplayName ?? entry.userEmail ?? "—"}</span>
                    <span>{formatDate(entry.occurredAt, { dateStyle: "medium", timeStyle: "short" })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
