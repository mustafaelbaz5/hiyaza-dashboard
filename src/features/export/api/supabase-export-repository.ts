import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { ok, err } from "@/lib/result";
import { fromSupabaseError } from "@/lib/errors";
import { TABLES } from "@/lib/constants";
import type { ExportFilters, ExportRepository, UnifiedExportRow } from "../types";

const EXPORT_CAP = 20_000;

/** Export repository — reads the unified_holdings_export view. Filtering lives here only;
 * the dataset builder and Excel mapper never see ExportFilters. This boundary ensures new
 * filter dimensions can be added to the repository without touching data-building or mapping
 * logic, keeping concerns cleanly separated. */
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

      // Apply cityId filter (most common use case)
      if (filters.cityId) {
        query = query.eq("city_id", filters.cityId);
      }

      // Apply associationType filter (wired in Phase E)
      if (filters.associationType) {
        query = query.eq("association_type", filters.associationType);
      }

      // Future: reviewStatus, approvalStatus, userId, etc. can be added here without
      // touching build-unified-dataset.ts or excel-mapper.ts (they only operate on
      // filtered results, not on the filter logic itself).

      // Apply custom filters if provided (allows adhoc querying without code changes)
      if (filters.custom) {
        for (const [key, value] of Object.entries(filters.custom)) {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        }
      }

      const { data, error } = await query;
      if (error) return err(fromSupabaseError(error));

      // database.types.ts is generated from the live DB and goes stale until regenerated after
      // a migration (e.g. 20260801201000 restoring this view's shape) — cast via unknown until
      // `supabase gen types` is re-run against the migrated database.
      return ok((data ?? []) as unknown as UnifiedExportRow[]);
    },
  };
}
