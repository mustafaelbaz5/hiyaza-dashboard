import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseExportRepository } from "../api/supabase-export-repository";
import { buildUnifiedDataset } from "../core/build-unified-dataset";
import { createExcelWorkbook, workbookToBlob } from "../core/excel-writer";
import type { ExportFilters } from "../types";

/** Hook for exporting unified holdings to Excel.
 *
 * Usage:
 * ```tsx
 * const { mutate, isPending, error } = useExportUnifiedHoldings();
 *
 * const handleExport = async () => {
 *   mutate({ cityId: "city-123" });
 * };
 * ```
 *
 * The mutation handles:
 * 1. Fetch unified_holdings_export view (fully merged, ready for export)
 * 2. Build dataset (snake_case → camelCase)
 * 3. Map to 25-column Excel format
 * 4. Generate workbook and trigger download
 */
export function useExportUnifiedHoldings() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const repo = createSupabaseExportRepository(supabase);

  return useMutation({
    mutationFn: async (filters: ExportFilters) => {
      // 1. Fetch unified holdings
      const result = await repo.list(filters);
      if (!result.ok) {
        throw new Error(result.error.message || "Failed to fetch holdings for export");
      }

      const rows = result.value;
      if (rows.length === 0) {
        throw new Error("No holdings to export. Try adjusting your filters.");
      }

      // 2. Build dataset (fully merged, ready for mapping)
      const dataset = buildUnifiedDataset(rows);

      // 3. Map to 25-column Excel format
      const workbook = createExcelWorkbook(dataset, "الحيازات");

      // 4. Generate blob and trigger download
      const blob = workbookToBlob(workbook);
      const filename = `holdings-export-${new Date().toISOString().split("T")[0]}.xlsx`;
      downloadBlob(blob, filename);

      return {
        count: rows.length,
        filename,
      };
    },

    onError: (error) => {
      console.error("Export failed:", error);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holdings"] });
    },
  });
}

/** Triggers browser download of a Blob with the given filename. */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
