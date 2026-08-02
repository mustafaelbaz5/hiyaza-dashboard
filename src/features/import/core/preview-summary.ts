import type { MappedHoldingRow } from "./map-rows";
import type { BlankRow } from "./validate-rows";
import { computeDedupKey } from "./dedup-key";
import type { DetectedAssociationType } from "./detect-association-type";
import type { AssociationType } from "@/lib/constants";

export interface SkippedSheet {
  name: string;
  reason: string;
}

export interface ImportDiff {
  newCount: number;
  changedCount: number;
  removedCount: number;
}

export interface PreviewSummary {
  rowsFound: number;
  rowsValid: number;
  rowsBlank: number;
  blankRows: BlankRow[];
  skippedSheets: SkippedSheet[];
  detectedAssociationName: string | null;
  detectedBasins: string[];
  detectedAssociationType: AssociationType | null;
  detectedAssociationTypeRaw: string | null;
  diff: ImportDiff;
}

/**
 * Builds the mandatory preview summary a user must see before any write happens
 * (DASHBOARD_PLAN.md § 6.3: "nothing is written until the user sees this"). The new/changed
 * counts here are an *estimate* — duplicate detection, upsert-vs-insert, and per-row
 * success/failure are only known for certain once the commit RPC actually runs (this file never
 * touches the database), so the commit result is the authoritative summary, this is a preview.
 */
export function buildPreviewSummary(
  validRows: MappedHoldingRow[],
  blank: BlankRow[],
  rowsFound: number,
  skippedSheets: SkippedSheet[],
  existingDedupKeys: Set<string>,
  detectedType: DetectedAssociationType = { type: null, rawLabel: null },
): PreviewSummary {
  const associationCounts = new Map<string, number>();
  const basins = new Set<string>();
  const incomingDedupKeys = new Set<string>();

  for (const row of validRows) {
    if (row.associationName) {
      associationCounts.set(row.associationName, (associationCounts.get(row.associationName) ?? 0) + 1);
    }
    if (row.basinName) basins.add(row.basinName);
    incomingDedupKeys.add(computeDedupKey(row));
  }

  const detectedAssociationName =
    [...associationCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  let newCount = 0;
  let changedCount = 0;
  for (const key of incomingDedupKeys) {
    if (existingDedupKeys.has(key)) changedCount++;
    else newCount++;
  }
  const removedCount = [...existingDedupKeys].filter((key) => !incomingDedupKeys.has(key)).length;

  return {
    rowsFound,
    rowsValid: validRows.length,
    rowsBlank: blank.length,
    blankRows: blank,
    skippedSheets,
    detectedAssociationName,
    detectedBasins: [...basins].sort(),
    detectedAssociationType: detectedType.type,
    detectedAssociationTypeRaw: detectedType.rawLabel,
    diff: { newCount, changedCount, removedCount },
  };
}
