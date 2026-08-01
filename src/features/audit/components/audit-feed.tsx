"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditFeed } from "../hooks/use-audit-feed";
import { AuditEntrySummary } from "./audit-entry-summary";
import { HoldingEditDiffView } from "./holding-edit-diff-view";
import { formatDate } from "@/lib/format";
import type { AuditFilters } from "../types";

/** Unified chronological audit feed with per-entry expand for field-level diffs. */
export function AuditFeed({ filters }: { filters: AuditFilters }) {
  const { data, isLoading, error, refetch } = useAuditFeed(filters);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const entries = useMemo(() => data ?? [], [data]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message="تعذر تحميل سجل النشاط" onRetry={() => refetch()} />;
  }

  if (entries.length === 0) {
    return <EmptyState title="لا يوجد نشاط بعد" description="ستظهر هنا كل التعديلات والاستيرادات ومراجعات الفريق" />;
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const key = `${entry.entityType}-${entry.entityId}`;
        const isExpanded = expandedId === key;
        const holdingId = entry.entityType === "holding_edit" ? (entry.details.holding_id as string) : null;

        return (
          <div key={key} className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <AuditEntrySummary entry={entry} />
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{entry.userDisplayName ?? entry.userEmail ?? "—"}</span>
                <span>{formatDate(entry.occurredAt, { dateStyle: "medium", timeStyle: "short" })}</span>
                {entry.entityType === "holding_edit" ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label={isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
                    onClick={() => setExpandedId(isExpanded ? null : key)}
                  >
                    {isExpanded ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                ) : null}
              </div>
            </div>
            {isExpanded && holdingId ? (
              <div className="mt-3 border-t border-border pt-3">
                <HoldingEditDiffView holdingId={holdingId} editId={entry.entityId} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
