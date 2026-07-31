import { Badge } from "@/components/ui/badge";
import type { CityStatus } from "../types";
import { cn } from "@/lib/utils";

const LABELS: Record<CityStatus, string> = {
  draft: "مسودة",
  published: "منشورة",
  archived: "مؤرشفة",
};

const STYLES: Record<CityStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-primary/15 text-primary",
  archived: "bg-secondary text-secondary-foreground",
};

export function CityStatusBadge({ status }: { status: CityStatus }) {
  return <Badge className={cn("border-0 font-normal", STYLES[status])}>{LABELS[status]}</Badge>;
}
