import { Badge } from "@/components/ui/badge";
import type { ReviewStatus } from "../types";
import { cn } from "@/lib/utils";

const LABELS: Record<ReviewStatus, string> = {
  pending: "قيد الانتظار",
  approved: "موافق عليه",
  rejected: "مرفوض",
};

const STYLES: Record<ReviewStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  approved: "bg-primary/15 text-primary",
  rejected: "bg-destructive/15 text-destructive",
};

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return <Badge className={cn("border-0 font-normal", STYLES[status])}>{LABELS[status]}</Badge>;
}
