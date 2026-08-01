import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { ok, err } from "@/lib/result";
import { fromSupabaseError } from "@/lib/errors";
import type { AnalyticsRepository } from "../types";

/** Analytics repository — every method reads a Postgres view/RPC, never aggregates client-side. */
export function createSupabaseAnalyticsRepository(
  supabase: SupabaseClient<Database>,
): AnalyticsRepository {
  return {
    async getSystemOverview() {
      const { data, error } = await supabase.from("system_overview").select("*").maybeSingle();
      if (error) return err(fromSupabaseError(error));
      return ok(data);
    },

    async getCityDrilldown(cityId: string) {
      const { data, error } = await supabase.rpc("city_drilldown", { p_city_id: cityId });
      if (error) return err(fromSupabaseError(error));
      return ok(data?.[0] ?? null);
    },

    async getBasinBreakdown(cityId: string) {
      const { data, error } = await supabase
        .from("city_basin_breakdown")
        .select("*")
        .eq("city_id", cityId)
        .order("holdings_count", { ascending: false });
      if (error) return err(fromSupabaseError(error));
      return ok(data ?? []);
    },

    async getTopHolders(cityId: string, limit: number) {
      const { data, error } = await supabase
        .from("city_top_holders")
        .select("*")
        .eq("city_id", cityId)
        .order("total_feddan", { ascending: false })
        .limit(limit);
      if (error) return err(fromSupabaseError(error));
      return ok(data ?? []);
    },

    async getFieldCompleteness(cityId?: string) {
      let query = supabase.from("city_field_completeness").select("*");
      if (cityId) query = query.eq("city_id", cityId);
      const { data, error } = await query;
      if (error) return err(fromSupabaseError(error));
      return ok(data ?? []);
    },

    async getQualityIssues(cityId?: string) {
      let query = supabase.from("city_quality_issues").select("*");
      if (cityId) query = query.eq("city_id", cityId);
      const { data, error } = await query;
      if (error) return err(fromSupabaseError(error));
      return ok(data ?? []);
    },

    async getTeamActivity() {
      const { data, error } = await supabase
        .from("team_activity")
        .select("*")
        .order("records_added", { ascending: false });
      if (error) return err(fromSupabaseError(error));
      return ok(data ?? []);
    },

    async captureQualitySnapshot(cityId: string) {
      const { data, error } = await supabase.rpc("capture_quality_snapshot", { p_city_id: cityId });
      if (error) return err(fromSupabaseError(error));
      return ok(data);
    },

    async getQualitySnapshotHistory(cityId: string) {
      const { data, error } = await supabase
        .from("quality_snapshots")
        .select("*")
        .eq("city_id", cityId)
        .order("captured_at", { ascending: false })
        .limit(30);
      if (error) return err(fromSupabaseError(error));
      return ok(data ?? []);
    },
  };
}
