import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/database.types";
import { ok, err } from "@/lib/result";
import { fromSupabaseError } from "@/lib/errors";
import { TABLES } from "@/lib/constants";
import type { CommitImportInput, ImportBatchSummary, ImportRepository } from "../types";

type ImportBatchRow = Database["public"]["Tables"]["import_batches"]["Row"];

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
    async getExistingUnifiedNumbers(cityId) {
      const { data, error } = await supabase
        .from(TABLES.holdings)
        .select("unified_number")
        .eq("city_id", cityId)
        .not("unified_number", "is", null);

      if (error) return err(fromSupabaseError(error));
      return ok(new Set(data.map((r) => r.unified_number as string)));
    },

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
        p_rows_imported: input.preview.rowsValid,
        p_rows_rejected: input.preview.rowsRejected,
        p_rejection_log: input.preview.rejections as unknown as Json,
        p_mapping_used: input.mappingUsed as unknown as Json,
        p_records: input.records as unknown as Json,
      });

      if (error) return err(fromSupabaseError(error));
      return ok(toBatchSummary(data));
    },

    async rollbackBatch(batchId) {
      const { error } = await supabase.rpc("rollback_import_batch", { p_batch_id: batchId });
      if (error) return err(fromSupabaseError(error));
      return ok(undefined);
    },
  };
}
