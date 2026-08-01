import * as XLSX from "xlsx";
import { ok, err, type Result } from "@/lib/result";

export interface ParsedSheet {
  name: string;
  rows: unknown[][];
}

export interface ParsedWorkbook {
  sheets: ParsedSheet[];
}

/**
 * Parses a workbook buffer into raw rows per sheet. Server-side only (Route Handler/Server
 * Action) — never ship a 5MB workbook parse to the browser (DASHBOARD_PLAN.md § 2).
 */
export function readWorkbook(buffer: ArrayBuffer | Buffer): Result<ParsedWorkbook, string> {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });
  } catch {
    return err("الملف تالف أو ليس بصيغة Excel صالحة");
  }

  if (workbook.SheetNames.length === 0) {
    return err("الملف لا يحتوي على أي أوراق عمل");
  }

  const sheets: ParsedSheet[] = workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    const rows = sheet
      ? (XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null }) as unknown[][])
      : [];
    return { name, rows };
  });

  return ok({ sheets });
}
