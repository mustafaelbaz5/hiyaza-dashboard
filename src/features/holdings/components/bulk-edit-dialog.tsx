"use client";

import { useState } from "react";
import { toast } from "sonner";
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

interface BulkEditDialogProps {
  cityId: string;
  selectedIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplied: () => void;
}

/** Bulk-apply-field, mirroring the app's existing bulkApplyField (DASHBOARD_PLAN.md § 6.4). */
export function BulkEditDialog({ cityId, selectedIds, open, onOpenChange, onApplied }: BulkEditDialogProps) {
  const [field, setField] = useState<EditableField>("basin_name");
  const [value, setValue] = useState("");
  const bulkApply = useBulkApplyField(cityId);

  function handleApply() {
    bulkApply.mutate(
      { cityId, holdingIds: selectedIds, field, newValue: value || null },
      {
        onSuccess: (count) => {
          toast.success(`تم تحديث ${count} حيازة`);
          onApplied();
          onOpenChange(false);
          setValue("");
        },
        onError: () => toast.error("تعذر تطبيق التعديل الجماعي"),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
          <Button
            onClick={handleApply}
            disabled={bulkApply.isPending || selectedIds.length === 0}
          >
            {bulkApply.isPending
              ? "جاري التطبيق..."
              : `تطبيق على ${formatNumber(selectedIds.length)} حيازة`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
