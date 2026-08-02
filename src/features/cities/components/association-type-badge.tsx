import { Badge } from "@/components/ui/badge";
import { ASSOCIATION_TYPE_LABELS } from "@/lib/constants";
import type { AssociationType } from "../types";
import { cn } from "@/lib/utils";

const STYLES: Record<AssociationType, string> = {
  agricultural_credit: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  agricultural_reform: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};

/** Shows the association's top-level type (+ subtype, if set) — "غير محدد" when not yet classified. */
export function AssociationTypeBadge({
  type,
  subtype,
}: {
  type: AssociationType | null;
  subtype: string | null;
}) {
  if (!type) {
    return <Badge className="border-0 bg-muted font-normal text-muted-foreground">غير محدد</Badge>;
  }

  const label = subtype ? `${ASSOCIATION_TYPE_LABELS[type]} — ${subtype}` : ASSOCIATION_TYPE_LABELS[type];

  return <Badge className={cn("border-0 font-normal", STYLES[type])}>{label}</Badge>;
}
