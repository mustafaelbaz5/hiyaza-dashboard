import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { ok, err } from "@/lib/result";
import { fromSupabaseError } from "@/lib/errors";
import { TABLES } from "@/lib/constants";
import type { ExportFilters, ExportRepository, UnifiedExportRow } from "../types";

const EXPORT_CAP = 20_000;

/** Export repository — reads the unified_holdings_export view. Filtering lives here only;
 * the dataset builder and Excel mapper never see ExportFilters (see DASHBOARD_ID_ALIGNMENT.md-
 * adjacent export plan for why this boundary matters for future filter dimensions). */
export function createSupabaseExportRepository(
  supabase: SupabaseClient<Database>,
): ExportRepository {
  return {
    async list(filters: ExportFilters) {
      let query = supabase
        .from(TABLES.unifiedHoldingsExport)
        .select("*")
        .eq("is_stale", false)
        .limit(EXPORT_CAP);

      if (filters.cityId) query = query.eq("city_id", filters.cityId);
      if (filters.associationType) query = query.eq("association_type", filters.associationType);

      const { data, error } = await query;
      if (error) return err(fromSupabaseError(error));

      return ok((data ?? []) as unknown as UnifiedExportRow[]);
    },
  };
}
