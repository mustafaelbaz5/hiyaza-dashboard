import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/database.types";
import { ok, err } from "@/lib/result";
import { fromSupabaseError } from "@/lib/errors";
import { TABLES } from "@/lib/constants";
import type { CommitImportInput, CommitImportResult, ImportBatchSummary, ImportRepository, ImportRowFailure } from "../types";

type ImportBatchRow = Database["public"]["Tables"]["import_batches"]["Row"];

interface CommitRpcResult {
  batchId: string;
  rowsTotal: number;
  rowsImported: number;
  rowsDuplicate: number;
  rowsFailed: number;
  rowsSkippedBlank: number;
  failures: ImportRowFailure[];
}

function toBatchSummary(row: ImportBatchRow): ImportBatchSummary {
  return {
    id: row.id,
    cityId: row.city_id,
    fileName: row.file_name,
    status: row.status,
    rowsTotal: row.rows_total,
    rowsImported: row.rows_imported,
    rowsRejected: row.rows_rejected,
    importedBy: row.imported_by,
    createdAt: row.created_at,
    committedAt: row.committed_at,
  };
}

/** Import repository backed by a real Supabase client — commit/rollback delegate to Postgres RPCs for atomicity. */
export function createSupabaseImportRepository(
  supabase: SupabaseClient<Database>,
): ImportRepository {
  return {
    async listBatches(cityId) {
      const { data, error } = await supabase
        .from(TABLES.importBatches)
        .select("*")
        .eq("city_id", cityId)
        .order("created_at", { ascending: false });

      if (error) return err(fromSupabaseError(error));
      return ok(data.map(toBatchSummary));
    },

    async commitImport(input: CommitImportInput) {
      const { data, error } = await supabase.rpc("commit_import_batch", {
        p_city_id: input.cityId,
        p_file_name: input.fileName,
        p_storage_path: input.storagePath ?? "",
        p_rows_total: input.preview.rowsFound,
        p_rows_skipped_blank: input.preview.rowsBlank,
        p_mapping_used: input.mappingUsed as unknown as Json,
        p_records: input.records as unknown as Json,
      });

      if (error) return err(fromSupabaseError(error));
      const result = data as unknown as CommitRpcResult;

      if (input.confirmedAssociationType) {
        // Best-effort: the import itself already succeeded above, so a failure here would be
        // confusing to surface as an import failure — the admin can still set the type manually
        // from Settings if this update doesn't land.
        await supabase
          .from(TABLES.cities)
          .update({ association_type: input.confirmedAssociationType })
          .eq("id", input.cityId);
      }

      const { data: batchRow, error: batchError } = await supabase
        .from(TABLES.importBatches)
        .select("*")
        .eq("id", result.batchId)
        .single();
      if (batchError) return err(fromSupabaseError(batchError));

      const commitResult: CommitImportResult = {
        batch: toBatchSummary(batchRow),
        rowsTotal: result.rowsTotal,
        rowsImported: result.rowsImported,
        rowsDuplicate: result.rowsDuplicate,
        rowsFailed: result.rowsFailed,
        rowsSkippedBlank: result.rowsSkippedBlank,
        failures: result.failures,
      };
      return ok(commitResult);
    },

    async rollbackBatch(batchId) {
      const { error } = await supabase.rpc("rollback_import_batch", { p_batch_id: batchId });
      if (error) return err(fromSupabaseError(error));
      return ok(undefined);
    },
  };
}
