"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { formatNumber } from "@/lib/format";
import type { CommitImportResult } from "../types";

function downloadFailuresCsv(failures: CommitImportResult["failures"]) {
  const header = "row,holder_name,reason\n";
  const body = failures
    .map((f) => `${f.row},"${(f.holderName ?? "").replace(/"/g, '""')}","${f.reason.replace(/"/g, '""')}"`)
    .join("\n");
  const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "import-failures.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * The authoritative import result — every row's actual outcome (imported, duplicate/skipped,
 * or failed), not the pre-commit estimate. Nothing here is client-side aggregation: these
 * numbers come straight from the commit RPC's per-row processing. A duplicate row (same
 * city + dedup_key as an existing non-stale holding) is skipped entirely, not merged or
 * updated — the existing row is left untouched.
 */
export function CommitResultStep({ result, onDone }: { result: CommitImportResult; onDone: () => void }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>ملخص الاستيراد</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="إجمالي الصفوف" value={formatNumber(result.rowsTotal)} />
            <StatCard label="تم الاستيراد" value={formatNumber(result.rowsImported)} />
            <StatCard label="مكررة (تم تجاهلها)" value={formatNumber(result.rowsDuplicate)} />
            <StatCard label="فشلت" value={formatNumber(result.rowsFailed)} />
          </div>

          {result.rowsSkippedBlank > 0 ? (
            <p className="text-sm text-muted-foreground">
              {formatNumber(result.rowsSkippedBlank)} صف فارغ تمامًا (لا يحتوي على أي بيانات) تم تجاهله —
              ليس جزءًا من بيانات العمل.
            </p>
          ) : null}

          {result.failures.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-destructive">
                  الصفوف التي فشل استيرادها ({formatNumber(result.failures.length)})
                </p>
                <Button variant="link" className="h-auto p-0" onClick={() => downloadFailuresCsv(result.failures)}>
                  تنزيل التفاصيل (CSV)
                </Button>
              </div>
              <div className="max-h-64 overflow-y-auto rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-start text-muted-foreground">
                      <th className="p-2 text-start">الصف</th>
                      <th className="p-2 text-start">الاسم</th>
                      <th className="p-2 text-start">السبب</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.failures.map((f) => (
                      <tr key={f.row} className="border-b border-border last:border-0">
                        <td className="p-2">{f.row}</td>
                        <td className="p-2">{f.holderName ?? "—"}</td>
                        <td className="p-2 text-destructive">{f.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onDone}>تم</Button>
      </div>
    </div>
  );
}
