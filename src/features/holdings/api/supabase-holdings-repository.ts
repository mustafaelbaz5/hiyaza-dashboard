import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { ok, err } from "@/lib/result";
import { fromSupabaseError } from "@/lib/errors";
import { TABLES } from "@/lib/constants";
import {
  mergeHolding,
  buildEditPayload,
  normalizeEditPayload,
  type EditPayload,
  type HoldingBaseRow,
} from "../core/merge-holding";
import type {
  ApplyEditInput,
  BulkApplyFieldInput,
  HoldingsListParams,
  HoldingsListResult,
  HoldingsRepository,
} from "../types";

async function fetchLatestEdits(
  supabase: SupabaseClient<Database>,
  holdingIds: string[],
): Promise<Map<string, EditPayload>> {
  if (holdingIds.length === 0) return new Map();

  const { data } = await supabase
    .from(TABLES.holdingEditsLatest)
    .select("holding_id, payload")
    .in("holding_id", holdingIds);

  const map = new Map<string, EditPayload>();
  for (const row of data ?? []) {
    const normalized = row.holding_id
      ? normalizeEditPayload(row.payload as Record<string, unknown>)
      : null;
    if (row.holding_id && normalized) map.set(row.holding_id, normalized);
  }
  return map;
}

/** Holdings repository backed by a real Supabase client — every read is merged with the latest edit overlay. */
export function createSupabaseHoldingsRepository(
  supabase: SupabaseClient<Database>,
): HoldingsRepository {
  return {
    async list(params: HoldingsListParams): Promise<import("@/lib/result").Result<HoldingsListResult, import("@/lib/errors").AppError>> {
      const { cityId, filters, sortBy, sortDirection, pageIndex, pageSize } = params;
      let query = supabase
        .from(TABLES.holdings)
        .select("*", { count: "exact" })
        .eq("city_id", cityId)
        .eq("is_stale", false);

      if (filters?.basinName) query = query.eq("basin_name", filters.basinName);
      if (filters?.search) {
        const term = `%${filters.search}%`;
        query = query.or(`holder_name.ilike.${term},national_id.ilike.${term},unified_number.ilike.${term}`);
      }
      if (sortBy) query = query.order(sortBy, { ascending: sortDirection !== "desc" });

      const from = pageIndex * pageSize;
      const { data, error, count } = await query.range(from, from + pageSize - 1);
      if (error) return err(fromSupabaseError(error));

      const holdings = (data ?? []) as unknown as HoldingBaseRow[];
      const editsByHolding = await fetchLatestEdits(supabase, holdings.map((h) => h.id));
      const rows = holdings.map((h) => mergeHolding(h, editsByHolding.get(h.id) ?? null));

      return ok({ rows, totalCount: count ?? 0 });
    },

    async applyEdit(input: ApplyEditInput) {
      const { data: holding, error: holdingError } = await supabase
        .from(TABLES.holdings)
        .select("*")
        .eq("id", input.holdingId)
        .single();
      if (holdingError) return err(fromSupabaseError(holdingError));

      const [latestEdits, {
        data: { user },
      }] = await Promise.all([
        fetchLatestEdits(supabase, [input.holdingId]),
        supabase.auth.getUser(),
      ]);

      const current = mergeHolding(holding as unknown as HoldingBaseRow, latestEdits.get(input.holdingId) ?? null);
      const payload = buildEditPayload(current, input.field, input.newValue);

      const { error } = await supabase.from(TABLES.holdingEdits).insert({
        holding_id: input.holdingId,
        city_id: input.cityId,
        payload,
        edited_by: user!.id,
      });
      if (error) return err(fromSupabaseError(error));
      return ok(undefined);
    },

    async bulkApplyField(input: BulkApplyFieldInput) {
      const { data: holdings, error: holdingsError } = await supabase
        .from(TABLES.holdings)
        .select("*")
        .in("id", input.holdingIds);
      if (holdingsError) return err(fromSupabaseError(holdingsError));

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const latestEdits = await fetchLatestEdits(supabase, input.holdingIds);

      const inserts = (holdings ?? []).map((h) => {
        const row = h as unknown as HoldingBaseRow;
        const current = mergeHolding(row, latestEdits.get(row.id) ?? null);
        return {
          holding_id: row.id,
          city_id: input.cityId,
          payload: buildEditPayload(current, input.field, input.newValue),
          edited_by: user!.id,
        };
      });

      const { error } = await supabase.from(TABLES.holdingEdits).insert(inserts);
      if (error) return err(fromSupabaseError(error));
      return ok(inserts.length);
    },

    async listAllForExport(cityId: string, filters) {
      const EXPORT_CAP = 20_000;
      let query = supabase
        .from(TABLES.holdings)
        .select("*")
        .eq("city_id", cityId)
        .eq("is_stale", false)
        .limit(EXPORT_CAP);

      if (filters?.basinName) query = query.eq("basin_name", filters.basinName);
      if (filters?.search) {
        const term = `%${filters.search}%`;
        query = query.or(`holder_name.ilike.${term},national_id.ilike.${term},unified_number.ilike.${term}`);
      }

      const { data, error } = await query;
      if (error) return err(fromSupabaseError(error));

      const holdings = (data ?? []) as unknown as HoldingBaseRow[];
      const editsByHolding = await fetchLatestEdits(supabase, holdings.map((h) => h.id));
      return ok(holdings.map((h) => mergeHolding(h, editsByHolding.get(h.id) ?? null)));
    },

    async listBasins(cityId: string) {
      const { data, error } = await supabase
        .from(TABLES.holdings)
        .select("basin_name")
        .eq("city_id", cityId)
        .eq("is_stale", false)
        .not("basin_name", "is", null);
      if (error) return err(fromSupabaseError(error));

      const basins = [...new Set((data ?? []).map((r) => r.basin_name as string))].sort();
      return ok(basins);
    },
  };
}
