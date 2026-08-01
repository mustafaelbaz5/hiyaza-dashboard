"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatCard } from "@/components/shared/stat-card";
import type { PreviewResponse } from "../schemas/preview-response-schema";
import { formatNumber } from "@/lib/format";

interface PreviewStepProps {
  data: PreviewResponse;
  fileName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isCommitting: boolean;
}

/** Step 2 — the mandatory preview. Nothing is written until the user confirms this screen. */
export function PreviewStep({ data, fileName, onConfirm, onCancel, isCommitting }: PreviewStepProps) {
  const { preview, parcelMismatches, records } = data;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>معاينة الاستيراد — {fileName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="صفوف موجودة" value={formatNumber(preview.rowsFound)} />
            <StatCard label="صفوف قابلة للاستيراد" value={formatNumber(preview.rowsValid)} />
            <StatCard label="صفوف فارغة تمامًا" value={formatNumber(preview.rowsBlank)} />
          </div>

          <p className="text-sm text-muted-foreground">
            كل صف يحتوي على أي بيانات سيُستورد، حتى لو كانت بعض الحقول فارغة — لا يتم تجاهل أي بيانات عمل.
            الصفوف &quot;الفارغة تمامًا&quot; فقط (بلا أي بيانات في أي عمود) لا تُستورد لأنها ليست سجلات فعلية.
          </p>

          <Separator />

          <div className="grid gap-2 text-sm sm:grid-cols-3">
            <p>جديد (تقديري): <span className="font-medium text-primary">{preview.diff.newCount}</span></p>
            <p>مكرر — سيُحدَّث (تقديري): <span className="font-medium">{preview.diff.changedCount}</span></p>
            <p>غير موجود بالملف: <span className="font-medium text-destructive">{preview.diff.removedCount}</span></p>
          </div>

          <div className="space-y-1 text-sm">
            <p>الجمعية المكتشفة: <span className="font-medium">{preview.detectedAssociationName ?? "—"}</span></p>
            <p>الأحواض المكتشفة ({preview.detectedBasins.length}): {preview.detectedBasins.join("، ") || "—"}</p>
          </div>

          {preview.skippedSheets.length > 0 ? (
            <div className="space-y-1 text-sm">
              <p className="font-medium">أوراق تم تجاهلها:</p>
              <div className="flex flex-wrap gap-1">
                {preview.skippedSheets.map((s) => (
                  <Badge key={s.name} variant="secondary">{s.name}</Badge>
                ))}
              </div>
            </div>
          ) : null}

          {parcelMismatches.length > 0 ? (
            <p className="text-sm text-destructive">
              تحذير: {parcelMismatches.length} حيازة لا يتطابق عدد قطعها مع العمود S
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isCommitting}>
          إلغاء
        </Button>
        <Button onClick={onConfirm} disabled={isCommitting || records.length === 0}>
          {isCommitting ? "جاري الحفظ..." : `تأكيد الاستيراد (${records.length} صف)`}
        </Button>
      </div>
    </div>
  );
}
