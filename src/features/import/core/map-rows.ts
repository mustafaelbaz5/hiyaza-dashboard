import type { ColumnMapping } from "./column-mapping";
import type { HeaderLocation } from "./locate-header-row";

export interface MappedHoldingRow {
  sourceRowNumber: number;
  holdingIdNumber: string | null;
  holderName: string | null;
  nationalId: string | null;
  landNumber: string | null;
  feddan: number;
  qirat: number;
  sahm: number;
  totalSqm: number | null;
  borderEast: string | null;
  borderWest: string | null;
  borderSouth: string | null;
  borderNorth: string | null;
  pageNumber: string | null;
  basinCode: string | null;
  basinName: string | null;
  associationName: string | null;
  administration: string | null;
  directorate: string | null;
  parcelCountCheck: number | null;
  unifiedNumber: string | null;
}

const NUMERIC_FIELDS = new Set(["feddan", "qirat", "sahm", "totalSqm", "parcelCountCheck"]);
const REQUIRED_NUMERIC_ZERO_DEFAULT = new Set(["feddan", "qirat", "sahm"]);

function cellText(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value).trim() || null;
}

function cellNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Turns raw sheet rows into a domain-shaped record keyed by the mapping's field names — driven
 * entirely by `mapping.fields` (label -> field), so a new ColumnMapping never requires touching
 * this function (OCP, DASHBOARD_PLAN.md § 3.1).
 */
export function mapRows(
  rows: unknown[][],
  header: HeaderLocation,
  mapping: ColumnMapping,
): MappedHoldingRow[] {
  const dataRows = rows.slice(header.rowIndex + 1);
  const labelByField = Object.fromEntries(
    Object.entries(mapping.fields).map(([label, field]) => [field, label]),
  );

  return dataRows.map((row, i): MappedHoldingRow => {
    const raw: Record<string, unknown> = {};
    for (const [field, label] of Object.entries(labelByField)) {
      const colIndex = header.columnIndexes[label];
      raw[field] = colIndex !== undefined ? row[colIndex] : undefined;
    }

    const parsed: Record<string, string | number | null> = {};
    for (const field of Object.keys(labelByField)) {
      if (NUMERIC_FIELDS.has(field)) {
        const n = cellNumberOrNull(raw[field]);
        parsed[field] = n ?? (REQUIRED_NUMERIC_ZERO_DEFAULT.has(field) ? 0 : null);
      } else {
        parsed[field] = cellText(raw[field]);
      }
    }
    if (parsed.basinCode === null) parsed.basinCode = "-1";

    return {
      sourceRowNumber: header.rowIndex + 2 + i,
      holdingIdNumber: parsed.holdingIdNumber as string | null,
      holderName: parsed.holderName as string | null,
      nationalId: parsed.nationalId as string | null,
      landNumber: parsed.landNumber as string | null,
      feddan: parsed.feddan as number,
      qirat: parsed.qirat as number,
      sahm: parsed.sahm as number,
      totalSqm: parsed.totalSqm as number | null,
      borderEast: parsed.borderEast as string | null,
      borderWest: parsed.borderWest as string | null,
      borderSouth: parsed.borderSouth as string | null,
      borderNorth: parsed.borderNorth as string | null,
      pageNumber: parsed.pageNumber as string | null,
      basinCode: parsed.basinCode as string | null,
      basinName: parsed.basinName as string | null,
      associationName: parsed.associationName as string | null,
      administration: parsed.administration as string | null,
      directorate: parsed.directorate as string | null,
      parcelCountCheck: parsed.parcelCountCheck as number | null,
      unifiedNumber: parsed.unifiedNumber as string | null,
    };
  });
}
