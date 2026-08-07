import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { HoldingProvenance } from "../core/merge-holding";

const LABELS: Record<HoldingProvenance, string> = {
  original: "أصلي",
  modified: "مُعدَّل",
  added: "مُضاف",
};

const STYLES: Record<HoldingProvenance, string> = {
  original: "bg-muted text-muted-foreground",
  modified: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  added: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
};

/** Shows whether a holding row is original (import, unedited), modified (has edits), or added (from added_holdings). */
export function ProvenanceBadge({ provenance }: { provenance: HoldingProvenance }) {
  return <Badge className={cn("border-0 font-normal", STYLES[provenance])}>{LABELS[provenance]}</Badge>;
}
