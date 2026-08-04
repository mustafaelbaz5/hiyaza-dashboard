import * as XLSX from "xlsx-js-style";
import type { UnifiedDatasetRow } from "./build-unified-dataset";
import { buildExcelHeader, mapToExcelRow, type ExcelExportRow } from "./excel-mapper";

/** Per-column widths (character units) tuned to real content. UUID columns need room for a full
 * 36-char id; short numeric/code columns stay compact. Falls back to header-length sizing for
 * any column not listed here. */
const COLUMN_WIDTHS: Partial<Record<keyof ExcelExportRow, number>> = {
  "كود القطعة": 38,
  "كود الشخص": 38,
  "رقم الحيازة": 16,
  "كود الجمعية الزراعية": 20,
  "اسم الجمعية": 26,
  "نوع الجمعية": 18,
  "تصنيف الجمعيات الزراعية": 22,
  "اسم المالك من الحصر الميداني": 24,
  "الرقم القومي للمالك": 20,
  "اسم الحائز من الحصر الميداني": 24,
  "الرقم القومي للحائز": 20,
  "رقم القطعة": 14,
  "المساحة الكلية للحيازة": 20,
  فدان: 10,
  قيراط: 10,
  سهم: 10,
  "كود الحوض": 14,
  "اسم الحوض": 20,
  "نوع التربة": 16,
  "نوع الاستخدام": 16,
  "نوع المحصول": 16,
  "مراحل النمو": 16,
  "اسم الحائز من كارت الفلاح": 24,
  "اسم المالك من كارت الفلاح": 24,
  "ملاحظات من فريق العمل الميداني": 32,
};

const HEADER_FILL = "1F4E78";
const ALT_ROW_FILL = "F2F2F2";
const THIN_BORDER = { style: "thin", color: { rgb: "D9D9D9" } } as const;

/** Creates an Excel workbook from fully-mapped export rows.
 * Handles header/data styling, column widths, freeze panes, autofilter, and RTL layout. */
export function createExcelWorkbook(
  rows: UnifiedDatasetRow[],
  worksheetName: string = "الحيازات",
): XLSX.WorkBook {
  const header = buildExcelHeader();
  const mappedRows: ExcelExportRow[] = rows.map(mapToExcelRow);

  // json_to_sheet already writes a header row from `header` (via the `header` option below) —
  // passing the header object again as the first data row would duplicate it as row 1.
  const ws = XLSX.utils.json_to_sheet(mappedRows, {
    header: Object.keys(header),
  });

  setColumnWidths(ws, header);
  styleHeaderRow(ws, header);
  styleDataRows(ws, header, mappedRows.length);
  applySheetLayout(ws, header, mappedRows.length);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, worksheetName);

  return wb;
}

/** Writes an Excel workbook to a Blob (for browser download). */
export function workbookToBlob(workbook: XLSX.WorkBook): Blob {
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/** Sets per-column widths tuned to real content, falling back to header-length sizing. */
function setColumnWidths(ws: XLSX.WorkSheet, header: ExcelExportRow): void {
  const columnWidths: XLSX.ColInfo[] = Object.keys(header).map((key) => ({
    wch: COLUMN_WIDTHS[key as keyof ExcelExportRow] ?? Math.max(15, key.length + 2),
  }));

  ws["!cols"] = columnWidths;
}

/** Bold white-on-blue header cells with borders, centered and wrapped for long Arabic labels. */
function styleHeaderRow(ws: XLSX.WorkSheet, header: ExcelExportRow): void {
  const keys = Object.keys(header);

  keys.forEach((_, colIndex) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });
    const cell = ws[cellRef];
    if (!cell) return;

    cell.s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: HEADER_FILL } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: THIN_BORDER,
        bottom: THIN_BORDER,
        left: THIN_BORDER,
        right: THIN_BORDER,
      },
    };
  });
}

/** Bordered, right-aligned data cells with alternating row shading for readability. */
function styleDataRows(ws: XLSX.WorkSheet, header: ExcelExportRow, rowCount: number): void {
  const colCount = Object.keys(header).length;

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const isAltRow = rowIndex % 2 === 1;

    for (let colIndex = 0; colIndex < colCount; colIndex++) {
      // +1: row 0 is the header row
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 1, c: colIndex });
      const cell = ws[cellRef];
      if (!cell) continue;

      cell.s = {
        alignment: { horizontal: "right", vertical: "center" },
        border: {
          top: THIN_BORDER,
          bottom: THIN_BORDER,
          left: THIN_BORDER,
          right: THIN_BORDER,
        },
        ...(isAltRow ? { fill: { fgColor: { rgb: ALT_ROW_FILL } } } : {}),
      };
    }
  }
}

/** Freeze panes, autofilter, and right-to-left sheet view. */
function applySheetLayout(ws: XLSX.WorkSheet, header: ExcelExportRow, rowCount: number): void {
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };

  const colCount = Object.keys(header).length;
  const lastCol = XLSX.utils.encode_col(colCount - 1);
  ws["!autofilter"] = { ref: `A1:${lastCol}${rowCount + 1}` };

  ws["!views"] = [{ rightToLeft: true }];
}
