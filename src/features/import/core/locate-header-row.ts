import type { ColumnMapping } from "./column-mapping";
import { ok, err, type Result } from "@/lib/result";

export interface HeaderLocation {
  rowIndex: number;
  /** header label -> 0-based column index */
  columnIndexes: Record<string, number>;
}

const MAX_SCAN_ROWS = 10;
const MIN_MATCH_RATIO = 0.5;

/**
 * Scans the first MAX_SCAN_ROWS rows for the one containing the most known header labels —
 * never hardcodes a row number, since row 3 in the sample file is a fact about that file, not
 * a guarantee about every city's workbook (APP_PLAN.md § 4).
 */
export function locateHeaderRow(
  rows: unknown[][],
  mapping: ColumnMapping,
): Result<HeaderLocation, string> {
  const knownLabels = Object.keys(mapping.fields);
  let best: HeaderLocation | null = null;
  let bestScore = 0;

  const scanLimit = Math.min(rows.length, MAX_SCAN_ROWS);
  for (let rowIndex = 0; rowIndex < scanLimit; rowIndex++) {
    const row = rows[rowIndex] ?? [];
    const columnIndexes: Record<string, number> = {};

    row.forEach((cell, colIndex) => {
      const label = typeof cell === "string" ? cell.trim() : "";
      if (label && knownLabels.includes(label)) {
        columnIndexes[label] = colIndex;
      }
    });

    const score = Object.keys(columnIndexes).length;
    if (score > bestScore) {
      bestScore = score;
      best = { rowIndex, columnIndexes };
    }
  }

  const requiredMatches = Math.ceil(knownLabels.length * MIN_MATCH_RATIO);
  if (!best || bestScore < requiredMatches) {
    return err(
      `تعذر العثور على صف العناوين. تم العثور على ${bestScore} من ${knownLabels.length} عمود متوقع كحد أقصى.`,
    );
  }

  return ok(best);
}
