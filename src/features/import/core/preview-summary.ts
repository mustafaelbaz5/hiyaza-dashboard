import type { MappedHoldingRow } from "./map-rows";
import type { RowRejection } from "./validate-rows";

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
  rowsRejected: number;
  rejections: RowRejection[];
  skippedSheets: SkippedSheet[];
  detectedAssociationName: string | null;
  detectedBasins: string[];
  diff: ImportDiff;
}

/**
 * Builds the mandatory preview summary a user must see before any write happens
 * (DASHBOARD_PLAN.md § 6.3: "nothing is written until the user sees this").
 */
export function buildPreviewSummary(
  validRows: MappedHoldingRow[],
  rejected: RowRejection[],
  rowsFound: number,
  skippedSheets: SkippedSheet[],
  existingUnifiedNumbers: Set<string>,
): PreviewSummary {
  const associationCounts = new Map<string, number>();
  const basins = new Set<string>();
  const incomingUnifiedNumbers = new Set<string>();

  for (const row of validRows) {
    if (row.associationName) {
      associationCounts.set(row.associationName, (associationCounts.get(row.associationName) ?? 0) + 1);
    }
    if (row.basinName) basins.add(row.basinName);
    if (row.unifiedNumber) incomingUnifiedNumbers.add(row.unifiedNumber);
  }

  const detectedAssociationName =
    [...associationCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  let newCount = 0;
  let changedCount = 0;
  for (const num of incomingUnifiedNumbers) {
    if (existingUnifiedNumbers.has(num)) changedCount++;
    else newCount++;
  }
  const removedCount = [...existingUnifiedNumbers].filter(
    (num) => !incomingUnifiedNumbers.has(num),
  ).length;

  return {
    rowsFound,
    rowsValid: validRows.length,
    rowsRejected: rejected.length,
    rejections: rejected,
    skippedSheets,
    detectedAssociationName,
    detectedBasins: [...basins].sort(),
    diff: { newCount, changedCount, removedCount },
  };
}
