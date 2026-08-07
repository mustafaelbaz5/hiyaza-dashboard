"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { HoldingEditDiffView } from "@/features/audit/components/holding-edit-diff-view";
import { useHoldingEditHistory } from "@/features/audit/hooks/use-holding-edit-history";
import { formatDate } from "@/lib/format";

/** Full edit history for one holding — every holding_edits row, newest first, each expandable to its field diff. */
export function HoldingHistoryTimeline({ holdingId }: { holdingId: string }) {
  const { data, isLoading, error, refetch } = useHoldingEditHistory(holdingId);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const entries = data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">سجل التعديلات</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message="تعذر تحميل سجل التعديلات" onRetry={() => refetch()} />
        ) : entries.length === 0 ? (
          <EmptyState title="لا توجد تعديلات على هذه الحيازة" description="ستظهر هنا كل التعديلات بترتيب زمني" />
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => {
              const isExpanded = expandedId === entry.editId;
              return (
                <div key={entry.editId} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {entry.editedByDisplayName ?? entry.editedByEmail ?? "—"}
                      </span>
                      {entry.targetWasStale && (
                        <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300">
                          حيازة قديمة
                        </span>
                      )}
                      {entry.holdingType === "added_holding" && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                          حيازة مضافة
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{formatDate(entry.editedAt, { dateStyle: "medium", timeStyle: "short" })}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        aria-label={isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
                        onClick={() => setExpandedId(isExpanded ? null : entry.editId)}
                      >
                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                      </Button>
                    </div>
                  </div>
                  {isExpanded ? (
                    <div className="mt-3 border-t border-border pt-3">
                      <HoldingEditDiffView holdingId={holdingId} editId={entry.editId} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
