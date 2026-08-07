"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EDITABLE_FIELDS, FIELD_LABELS, type EditableField } from "../core/editable-fields";
import { useBulkApplyField } from "../hooks/use-holding-mutations";
import { formatNumber } from "@/lib/format";
import type { MergedHolding } from "../core/merge-holding";

interface BulkEditDialogProps {
  cityId: string;
  selectedHoldings: MergedHolding[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplied: () => void;
}

type Step = "form" | "confirm" | "result";

function fieldValue(holding: MergedHolding, field: EditableField): string {
  const value = holding[field];
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

/**
 * Bulk-apply-field, mirroring the app's existing bulkApplyField (DASHBOARD_PLAN.md § 6.4).
 * Three-step flow (form -> confirm -> result) so an admin sees exactly which holdings and current
 * values will be overwritten before committing — the underlying write is a single all-or-nothing
 * insert (no partial-failure state is possible), so the result step is a clear summary, not a
 * per-row status list.
 */
export function BulkEditDialog({ cityId, selectedHoldings, open, onOpenChange, onApplied }: BulkEditDialogProps) {
  const [step, setStep] = useState<Step>("form");
  const [field, setField] = useState<EditableField>("basin_name");
  const [value, setValue] = useState("");
  const bulkApply = useBulkApplyField(cityId);
  const selectedIds = selectedHoldings.map((h) => h.id);

  function reset() {
    setStep("form");
    setValue("");
    bulkApply.reset();
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  function handleApply() {
    bulkApply.mutate(
      { cityId, holdingIds: selectedIds, field, newValue: value || null },
      {
        onSuccess: () => {
          setStep("result");
          onApplied();
        },
        onError: () => {
          toast.error("تعذر تطبيق التعديل الجماعي");
          setStep("form");
        },
      },
    );
  }

  const unchangedCount = selectedHoldings.filter((h) => fieldValue(h, field) === (value || "—")).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>تعديل جماعي</DialogTitle>
              <DialogDescription>
                سيتم تطبيق القيمة الجديدة على {formatNumber(selectedIds.length)} حيازة محددة
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>الحقل</Label>
                <Select value={field} onValueChange={(v) => setField(v as EditableField)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EDITABLE_FIELDS.map((f) => (
                      <SelectItem key={f} value={f}>
                        {FIELD_LABELS[f]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>القيمة الجديدة</Label>
                <Input value={value} onChange={(e) => setValue(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setStep("confirm")} disabled={selectedIds.length === 0}>
                التالي — مراجعة التغييرات
              </Button>
            </DialogFooter>
          </>
        ) : null}

        {step === "confirm" ? (
          <>
            <DialogHeader>
              <DialogTitle>تأكيد التعديل الجماعي</DialogTitle>
              <DialogDescription>
                سيتم تعيين <strong>{FIELD_LABELS[field]}</strong> إلى{" "}
                <strong>{value || "—"}</strong> لكل الحيازات التالية. هذا الإجراء يُسجَّل في سجل
                التعديلات ولا يمكن التراجع عنه تلقائيًا.
              </DialogDescription>
            </DialogHeader>
            {unchangedCount > 0 ? (
              <div className="flex items-start gap-2 rounded-md border border-amber-500 bg-amber-50 p-3 text-sm text-amber-800">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                <span>
                  {formatNumber(unchangedCount)} من الحيازات المحددة تحمل بالفعل هذه القيمة —
                  سيُسجَّل لها تعديل بلا تغيير فعلي في البيانات.
                </span>
              </div>
            ) : null}
            <div className="max-h-64 overflow-y-auto rounded-md border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-start text-muted-foreground">
                    <th className="p-2 text-start">رقم الحيازة</th>
                    <th className="p-2 text-start">الاسم</th>
                    <th className="p-2 text-start">القيمة الحالية</th>
                    <th className="p-2 text-start">القيمة الجديدة</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedHoldings.map((h) => (
                    <tr key={h.id} className="border-b border-border last:border-0">
                      <td className="p-2">{h.holding_id_number ?? "—"}</td>
                      <td className="p-2">{h.holder_name ?? "—"}</td>
                      <td className="p-2 text-muted-foreground">{fieldValue(h, field)}</td>
                      <td className="p-2 font-medium">{value || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <DialogFooter className="gap-2 sm:justify-between">
              <Button variant="outline" onClick={() => setStep("form")} disabled={bulkApply.isPending}>
                رجوع
              </Button>
              <Button onClick={handleApply} disabled={bulkApply.isPending}>
                {bulkApply.isPending
                  ? "جاري التطبيق..."
                  : `تأكيد التطبيق على ${formatNumber(selectedIds.length)} حيازة`}
              </Button>
            </DialogFooter>
          </>
        ) : null}

        {step === "result" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-600" />
                تم التعديل الجماعي بنجاح
              </DialogTitle>
              <DialogDescription>
                تم تحديث <strong>{FIELD_LABELS[field]}</strong> إلى{" "}
                <strong>{value || "—"}</strong> لعدد {formatNumber(bulkApply.data ?? selectedIds.length)}{" "}
                حيازة. يمكن مراجعة كل تعديل من سجل التعديلات الخاص بكل حيازة.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => handleClose(false)}>تم</Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
