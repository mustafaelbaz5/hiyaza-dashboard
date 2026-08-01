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
import { useApproveAddedHolding } from "../hooks/use-review-mutations";
import type { AddedHolding } from "../types";

interface ApproveDialogProps {
  record: AddedHolding | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Approve step: optionally assign the official رقم الحيازة (null stays "بدون رقم — جديد" for a
 * brand-new person per APP_PLAN.md § 6.2 — the government, not the app, assigns that number).
 */
export function ApproveDialog({ record, onOpenChange }: ApproveDialogProps) {
  const [holdingIdNumber, setHoldingIdNumber] = useState("");
  const approve = useApproveAddedHolding();

  function handleApprove() {
    if (!record) return;
    approve.mutate(
      { addedHoldingId: record.id, holdingIdNumber: holdingIdNumber || null },
      {
        onSuccess: () => {
          toast.success("تمت الموافقة وترقية السجل إلى الحيازات");
          onOpenChange(false);
          setHoldingIdNumber("");
        },
        onError: () => toast.error("تعذرت الموافقة على السجل"),
      },
    );
  }

  return (
    <Dialog open={Boolean(record)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>الموافقة على {record?.holderName}</DialogTitle>
          <DialogDescription>
            سيتم ترقية هذا السجل إلى جدول الحيازات الرسمي. اترك رقم الحيازة فارغًا إذا لم يُخصَّص بعد.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="holdingIdNumber">رقم الحيازة الرسمي (اختياري)</Label>
          <Input
            id="holdingIdNumber"
            value={holdingIdNumber}
            onChange={(e) => setHoldingIdNumber(e.target.value)}
            placeholder="بدون رقم — جديد"
          />
        </div>
        <DialogFooter>
          <Button onClick={handleApprove} disabled={approve.isPending}>
            {approve.isPending ? "جاري الموافقة..." : "موافقة وترقية"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
