import type { MappedHoldingRow } from "./map-rows";

export interface BlankRow {
  row: number;
}

export interface ValidatedRows {
  /** Every row with any real data — imported regardless of which fields are missing. */
  valid: MappedHoldingRow[];
  /** Rows with literally no data in any field — spreadsheet artifacts (e.g. a trailing blank
   *  row past the real data range), not business records. Not "invalid data" — there is no data. */
  blank: BlankRow[];
}

const IDENTIFYING_FIELDS: (keyof MappedHoldingRow)[] = [
  "holdingIdNumber",
  "unifiedNumber",
  "holderName",
  "nationalId",
  "landNumber",
  "pageNumber",
  "basinCode",
  "basinName",
  "associationName",
  "administration",
  "directorate",
  "borderEast",
  "borderWest",
  "borderSouth",
  "borderNorth",
];

function isEntirelyBlank(row: MappedHoldingRow): boolean {
  const hasAnyText = IDENTIFYING_FIELDS.some((field) => row[field] !== null);
  const hasAnyArea = row.feddan !== 0 || row.qirat !== 0 || row.sahm !== 0 || (row.totalSqm ?? 0) !== 0;
  return !hasAnyText && !hasAnyArea;
}

/**
 * The source Excel file is the source of truth (business requirement) — every row with any real
 * data is imported, however incomplete. Missing values (missing holder name, national id, crop
 * type, notes, area, borders, credit type, etc.) are business data as-is, not import errors, and
 * are never a reason to drop a row. The only rows set aside here are ones with no data in any
 * field at all — an artifact of the spreadsheet, not a record to import.
 */
export function validateRows(rows: MappedHoldingRow[]): ValidatedRows {
  const valid: MappedHoldingRow[] = [];
  const blank: BlankRow[] = [];

  for (const row of rows) {
    if (isEntirelyBlank(row)) {
      blank.push({ row: row.sourceRowNumber });
      continue;
    }
    valid.push(row);
  }

  return { valid, blank };
}
