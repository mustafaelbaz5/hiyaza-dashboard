"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRejectAddedHolding } from "../hooks/use-review-mutations";
import type { AddedHolding } from "../types";

interface RejectDialogProps {
  record: AddedHolding | null;
  onOpenChange: (open: boolean) => void;
}

export function RejectDialog({ record, onOpenChange }: RejectDialogProps) {
  const [reason, setReason] = useState("");
  const reject = useRejectAddedHolding();

  function handleReject() {
    if (!record || !reason.trim()) return;
    reject.mutate(
      { addedHoldingId: record.id, reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success("تم رفض السجل");
          onOpenChange(false);
          setReason("");
        },
        onError: () => toast.error("تعذر رفض السجل"),
      },
    );
  }

  return (
    <Dialog open={Boolean(record)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>رفض {record?.holderName}</DialogTitle>
          <DialogDescription>سبب الرفض مطلوب — يبقى السجل مرئيًا للتدقيق ولا يُحذف.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reason">سبب الرفض</Label>
          <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={reject.isPending || !reason.trim()}
          >
            {reject.isPending ? "جاري الرفض..." : "رفض"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
