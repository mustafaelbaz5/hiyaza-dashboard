"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseExportRepository } from "../api/supabase-export-repository";
import { buildUnifiedDataset, type UnifiedDatasetRow } from "../core/build-unified-dataset";
import { mapToExcelRow, buildExcelHeader, type ExcelExportRow } from "../core/excel-mapper";
import { ExportButton } from "../components/export-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UnifiedExportRow } from "../types";

interface SampleRow {
  raw: UnifiedExportRow;
  dataset: UnifiedDatasetRow;
  mapped: ExcelExportRow;
}

/** Development page for manual export testing.
 * Allows verification of:
 * - Multi-field edit merging
 * - Field-added parcels inclusion
 * - Excel format and column order
 * - Download functionality
 */
export function ExportTestPage() {
  const [cityId, setCityId] = useState<string>("");
  const [testResults, setTestResults] = useState<{
    totalRows: number;
    sampleRow: SampleRow;
    columnCount: number;
    columnNames: string[];
  } | null>(null);

  const supabase = createClient();
  const repo = createSupabaseExportRepository(supabase);

  const handlePreviewExport = async () => {
    setTestResults(null);
    try {
      const result = await repo.list({ cityId: cityId || undefined });
      if (!result.ok) {
        alert(`Error: ${result.error.message}`);
        return;
      }

      const rows = result.value;
      if (rows.length === 0) {
        alert("No holdings found");
        return;
      }

      const dataset = buildUnifiedDataset(rows);
      const header = buildExcelHeader();
      const firstRawRow = rows[0];
      const firstRow = dataset[0];
      const firstMapped = firstRow ? mapToExcelRow(firstRow) : null;

      if (firstRawRow && firstRow && firstMapped) {
        setTestResults({
          totalRows: rows.length,
          sampleRow: {
            raw: firstRawRow,
            dataset: firstRow,
            mapped: firstMapped,
          },
          columnCount: Object.keys(header).length,
          columnNames: Object.keys(header),
        });
      }
    } catch (error) {
      alert(`Exception: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Export Pipeline Test</h1>
        <p className="text-gray-600">Manual testing for end-to-end export verification</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>Set filters and preview export data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">City ID (optional)</label>
            <input
              type="text"
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              placeholder="Leave blank for all cities"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePreviewExport} variant="outline">
              Preview Export Data
            </Button>
            <ExportButton filters={{ cityId: cityId || undefined }} />
          </div>
        </CardContent>
      </Card>

      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Export Preview</CardTitle>
            <CardDescription>
              Total rows: {testResults.totalRows} | Columns: {testResults.columnCount}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Column Order (Verification)</h3>
              <div className="bg-gray-50 p-3 rounded max-h-48 overflow-y-auto text-sm">
                <ol className="list-decimal list-inside space-y-1">
                  {testResults.columnNames.map((col, idx) => (
                    <li key={idx}>
                      <span className="font-mono text-blue-600">{idx + 1}.</span> {col}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Sample Row (First Holding)</h3>
              <details className="bg-gray-50 p-3 rounded">
                <summary className="cursor-pointer font-medium">
                  Raw UnifiedExportRow (before mapping)
                </summary>
                <pre className="mt-2 text-xs overflow-x-auto">
                  {JSON.stringify(testResults.sampleRow.raw, null, 2).slice(0, 500)}...
                </pre>
              </details>

              <details className="bg-gray-50 p-3 rounded mt-2">
                <summary className="cursor-pointer font-medium">
                  UnifiedDatasetRow (after dataset builder)
                </summary>
                <pre className="mt-2 text-xs overflow-x-auto">
                  {JSON.stringify(testResults.sampleRow.dataset, null, 2).slice(0, 500)}...
                </pre>
              </details>

              <details className="bg-gray-50 p-3 rounded mt-2">
                <summary className="cursor-pointer font-medium">
                  ExcelExportRow (after mapper — 25 columns)
                </summary>
                <pre className="mt-2 text-xs overflow-x-auto">
                  {JSON.stringify(testResults.sampleRow.mapped, null, 2)}
                </pre>
              </details>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Verification Checklist</h3>
              <ul className="space-y-2 text-sm">
                <li className={`flex items-center gap-2 ${testResults.columnCount === 25 ? "text-green-600" : "text-red-600"}`}>
                  <span>{testResults.columnCount === 25 ? "✓" : "✗"}</span>
                  Exactly 25 columns
                </li>
                <li className={`flex items-center gap-2 ${testResults.totalRows > 0 ? "text-green-600" : "text-red-600"}`}>
                  <span>{testResults.totalRows > 0 ? "✓" : "✗"}</span>
                  Data fetched ({testResults.totalRows} rows)
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span>→</span>
                  Click &quot;تصدير إلى Excel&quot; to download full export
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <span>→</span>
                  Verify in Excel: column order, multi-edit fields merged, no omitted columns
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
