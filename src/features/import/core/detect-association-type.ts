import { ASSOCIATION_TYPE_LABELS, type AssociationType } from "@/lib/constants";

export interface DetectedAssociationType {
  type: AssociationType | null;
  rawLabel: string | null;
}

const PREFIX = "القطاع";

/**
 * Reads row 1 of the source sheet ("القطاع : الإصلاح الزراعي" / "القطاع : الائتمان الزراعي") and
 * maps it to an AssociationType. Never guesses on an unrecognized label — returns type: null with
 * the raw text preserved, so the import preview can show the admin exactly what was found and let
 * them classify it manually, matching this codebase's "fail loudly, never guess silently"
 * principle already applied to column mapping (column-mapping.ts).
 */
export function detectAssociationType(rows: unknown[][]): DetectedAssociationType {
  const firstRow = rows[0];
  const firstCell = firstRow?.[0];
  if (typeof firstCell !== "string") return { type: null, rawLabel: null };

  const trimmed = firstCell.trim();
  if (!trimmed.startsWith(PREFIX)) return { type: null, rawLabel: null };

  const rawLabel = trimmed.split(":").slice(1).join(":").trim() || null;
  if (!rawLabel) return { type: null, rawLabel: null };

  const matchedType = (Object.keys(ASSOCIATION_TYPE_LABELS) as AssociationType[]).find(
    (type) => ASSOCIATION_TYPE_LABELS[type] === rawLabel,
  );

  return { type: matchedType ?? null, rawLabel };
}
