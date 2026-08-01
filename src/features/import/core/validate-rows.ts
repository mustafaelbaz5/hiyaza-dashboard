import type { MappedHoldingRow } from "./map-rows";

export interface RowRejection {
  row: number;
  column: string;
  reason: string;
}

export interface ValidatedRows {
  valid: MappedHoldingRow[];
  rejected: RowRejection[];
}

/**
 * Rejects rows that are structurally unusable (no holder name), or that would silently corrupt
 * data on write: فدان/قيراط/سهم are `int` columns in the real schema (APP_PLAN.md § 6), and a
 * fractional سهم (confirmed present in ~0.6% of the real sample workbook) cannot be rounded
 * without changing a legal land-share value — reject and surface it instead of guessing.
 * Everything else (bad national id, zero area, missing basin) is intentionally *not* a blocker —
 * those are recomputed live from `holdings` by the quality board (DASHBOARD_PLAN.md § 6.7).
 */
export function validateRows(rows: MappedHoldingRow[]): ValidatedRows {
  const valid: MappedHoldingRow[] = [];
  const rejected: RowRejection[] = [];

  for (const row of rows) {
    if (!row.holderName) {
      rejected.push({
        row: row.sourceRowNumber,
        column: "اسم الحائز",
        reason: "اسم الحائز مفقود — لا يمكن استيراد صف بدون اسم",
      });
      continue;
    }

    const fractionalField = ([
      ["فدان", row.feddan],
      ["قيراط", row.qirat],
      ["سهم", row.sahm],
    ] as const).find(([, value]) => !Number.isInteger(value));

    if (fractionalField) {
      const [column, value] = fractionalField;
      rejected.push({
        row: row.sourceRowNumber,
        column,
        reason: `قيمة "${column}" (${value}) ليست عددًا صحيحًا — يتطلب مراجعة يدوية قبل الاستيراد`,
      });
      continue;
    }

    valid.push(row);
  }

  return { valid, rejected };
}
