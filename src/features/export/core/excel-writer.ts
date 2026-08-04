import * as XLSX from "xlsx";
import { buildExcelHeader, mapToExcelRow, type ExcelExportRow } from "./excel-mapper";
import type { UnifiedDatasetRow } from "./build-unified-dataset";

/** Creates an Excel workbook from fully-mapped export rows.
 * Handles header generation, column widths, and proper formatting. */
export function createExcelWorkbook(
  rows: UnifiedDatasetRow[],
  worksheetName: string = "الحيازات"
): XLSX.WorkBook {
  const header = buildExcelHeader();
  const mappedRows: ExcelExportRow[] = rows.map(mapToExcelRow);

  const wsData: unknown[] = [header as unknown, ...mappedRows];

  const ws = XLSX.utils.json_to_sheet(wsData, {
    header: Object.keys(header),
  });

  setColumnWidths(ws, header);
  setHeaderStyle(ws);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, worksheetName);

  return wb;
}

/** Writes an Excel workbook to a Blob (for browser download). */
export function workbookToBlob(workbook: XLSX.WorkBook): Blob {
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

/** Sets sensible column widths based on header content. */
function setColumnWidths(ws: XLSX.WorkSheet, header: ExcelExportRow): void {
  const columnWidths: XLSX.ColInfo[] = [];

  for (const key of Object.keys(header)) {
    columnWidths.push({
      wch: Math.max(15, key.length + 2), // Minimum 15, or header length + 2
    });
  }

  ws["!cols"] = columnWidths;
}

/** Marks the header row for Excel formatting (bold, frozen panes). */
function setHeaderStyle(ws: XLSX.WorkSheet): void {
  // Freeze panes at row 1 (keep header visible when scrolling)
  ws["!freeze"] = { xSplit: 0, ySplit: 1 };
}
