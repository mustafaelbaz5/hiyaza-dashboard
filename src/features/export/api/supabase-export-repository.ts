import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { ok, err } from "@/lib/result";
import { fromSupabaseError } from "@/lib/errors";
import { TABLES } from "@/lib/constants";
import type { ExportFilters, ExportRepository, UnifiedExportRow } from "../types";

// PostgREST caps every request at its own max-rows setting (1000 by default) regardless of a
// client-supplied .limit() — a single .limit(20000) call has never actually returned more than
// ~1000 rows. PAGE_SIZE mirrors that default cap; the repository pages through with .range()
// until a page comes back short, accumulating the full result set. EXPORT_SAFETY_CAP is a hard
// ceiling on total accumulated rows so a misconfiguration can't page forever.
const PAGE_SIZE = 1000;
const EXPORT_SAFETY_CAP = 20_000;

/** Export repository — reads the unified_holdings_export view. Filtering lives here only;
 * the dataset builder and Excel mapper never see ExportFilters. This boundary ensures new
 * filter dimensions can be added to the repository without touching data-building or mapping
 * logic, keeping concerns cleanly separated. */
export function createSupabaseExportRepository(
  supabase: SupabaseClient<Database>,
): ExportRepository {
  return {
    async list(filters: ExportFilters) {
      const buildQuery = () => {
        let query = supabase
          .from(TABLES.unifiedHoldingsExport)
          .select("*")
          .eq("is_stale", false)
          // Group rows by basin for a readable sheet; holding_id_number is a stable secondary
          // key so row order is deterministic across repeated exports of the same data.
          .order("basin_name", { ascending: true, nullsFirst: false })
          .order("holding_id_number", { ascending: true, nullsFirst: false });

        if (filters.cityId) {
          query = query.eq("city_id", filters.cityId);
        }

        if (filters.associationType) {
          query = query.eq("association_type", filters.associationType);
        }

        // Future: reviewStatus, approvalStatus, userId, etc. can be added here without
        // touching build-unified-dataset.ts or excel-mapper.ts (they only operate on
        // filtered results, not on the filter logic itself).

        if (filters.custom) {
          for (const [key, value] of Object.entries(filters.custom)) {
            if (value !== undefined && value !== null) {
              query = query.eq(key, value);
            }
          }
        }

        return query;
      };

      const rows: UnifiedExportRow[] = [];

      for (let from = 0; from < EXPORT_SAFETY_CAP; from += PAGE_SIZE) {
        const to = from + PAGE_SIZE - 1;
        const { data, error } = await buildQuery().range(from, to);
        if (error) return err(fromSupabaseError(error));

        // database.types.ts is generated from the live DB and goes stale until regenerated
        // after a migration (e.g. 20260801201000 restoring this view's shape) — cast via
        // unknown until `supabase gen types` is re-run against the migrated database.
        const page = (data ?? []) as unknown as UnifiedExportRow[];
        rows.push(...page);

        if (page.length < PAGE_SIZE) break; // last page reached
      }

      return ok(rows);
    },
  };
}
