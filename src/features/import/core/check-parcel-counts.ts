import type { MappedHoldingRow } from "./map-rows";

export interface ParcelCountMismatch {
  holdingIdNumber: string;
  expected: number;
  actual: number;
}

/**
 * Column S (عدد القطع بالحيازة) is a precomputed per-holding parcel count — never stored, only
 * used as an import validation check (APP_PLAN.md § 4 / DASHBOARD_PLAN.md § 6.3): if the
 * imported row count for a هوية doesn't match, the batch should be flagged.
 */
export function checkParcelCounts(rows: MappedHoldingRow[]): ParcelCountMismatch[] {
  const actualCounts = new Map<string, number>();
  const expectedCounts = new Map<string, number>();

  for (const row of rows) {
    if (!row.holdingIdNumber) continue;
    actualCounts.set(row.holdingIdNumber, (actualCounts.get(row.holdingIdNumber) ?? 0) + 1);
    if (row.parcelCountCheck !== null) {
      expectedCounts.set(row.holdingIdNumber, row.parcelCountCheck);
    }
  }

  const mismatches: ParcelCountMismatch[] = [];
  for (const [holdingIdNumber, expected] of expectedCounts) {
    const actual = actualCounts.get(holdingIdNumber) ?? 0;
    if (actual !== expected) {
      mismatches.push({ holdingIdNumber, expected, actual });
    }
  }

  return mismatches;
}
