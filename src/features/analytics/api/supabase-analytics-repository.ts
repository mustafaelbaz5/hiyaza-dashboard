import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { ok, err } from "@/lib/result";
import { fromSupabaseError } from "@/lib/errors";
import type { AnalyticsRepository, QualityIssueHolding } from "../types";

const QUALITY_ISSUE_LIMIT = 100;

function toIssueHolding(row: { id: string; holding_id_number: string | null; holder_name: string | null }): QualityIssueHolding {
  return { id: row.id, holdingIdNumber: row.holding_id_number, holderName: row.holder_name };
}

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

    async getQualityIssueHoldings(cityId, ruleKey) {
      const base = supabase
        .from("holdings")
        .select("id, holding_id_number, holder_name")
        .eq("city_id", cityId)
        .eq("is_stale", false);

      if (ruleKey === "missing_or_invalid_national_id") {
        // Mirrors city_quality_issues' predicate exactly (does NOT exclude the '1111111111'
        // placeholder — that exemption belongs to the separate national_id format CHECK
        // constraint, a different rule with a different purpose) so this drill-down's rows
        // always reconcile with the count shown next to it. Split into two queries (null/empty,
        // and non-null-but-not-14-digits) rather than one OR string — a combined .or() with a
        // regex clause was verified against live data to silently return the wrong count when
        // mixed with a null check in the same expression.
        const [{ data: nullOrEmpty, error: e1 }, { data: badFormat, error: e2 }] = await Promise.all([
          base.or("national_id.is.null,national_id.eq.").limit(QUALITY_ISSUE_LIMIT),
          base
            .not("national_id", "is", null)
            .neq("national_id", "")
            .not("national_id", "match", "^\\d{14}$")
            .limit(QUALITY_ISSUE_LIMIT),
        ]);
        if (e1) return err(fromSupabaseError(e1));
        if (e2) return err(fromSupabaseError(e2));
        const merged = [...(nullOrEmpty ?? []), ...(badFormat ?? [])].slice(0, QUALITY_ISSUE_LIMIT);
        return ok(merged.map(toIssueHolding));
      }

      if (ruleKey === "placeholder_borders") {
        // Mirrors city_quality_issues' predicate: all four borders are null-or-'0'. Verified
        // directly against live data (returned the same count as city_quality_issues.
        // placeholder_borders for a real city) — postgrest-js has no chainable .and(), so a
        // compound and(...)/or(...) expression must be passed as one .or() string.
        const { data, error } = await base
          .or(
            "and(border_east.is.null,border_west.is.null,border_south.is.null,border_north.is.null)," +
              "and(border_east.eq.0,border_west.eq.0,border_south.eq.0,border_north.eq.0)",
          )
          .limit(QUALITY_ISSUE_LIMIT);
        if (error) return err(fromSupabaseError(error));
        return ok((data ?? []).map(toIssueHolding));
      }

      if (ruleKey === "zero_area") {
        const { data, error } = await base
          .eq("feddan", 0)
          .eq("qirat", 0)
          .eq("sahm", 0)
          .limit(QUALITY_ISSUE_LIMIT);
        if (error) return err(fromSupabaseError(error));
        return ok((data ?? []).map(toIssueHolding));
      }

      if (ruleKey === "missing_basin_code") {
        const { data, error } = await base
          .or("basin_code.is.null,basin_code.eq.-1")
          .limit(QUALITY_ISSUE_LIMIT);
        if (error) return err(fromSupabaseError(error));
        return ok((data ?? []).map(toIssueHolding));
      }

      // duplicate_unified_number: no single Postgrest filter expresses "shares a value with
      // another row" — find which unified_numbers repeat, then fetch the rows carrying them.
      const { data: allNumbers, error: numbersError } = await supabase
        .from("holdings")
        .select("unified_number")
        .eq("city_id", cityId)
        .eq("is_stale", false)
        .not("unified_number", "is", null);
      if (numbersError) return err(fromSupabaseError(numbersError));

      const counts = new Map<string, number>();
      for (const row of allNumbers ?? []) {
        const n = row.unified_number as string;
        counts.set(n, (counts.get(n) ?? 0) + 1);
      }
      const duplicateNumbers = [...counts.entries()].filter(([, c]) => c > 1).map(([n]) => n);
      if (duplicateNumbers.length === 0) return ok([]);

      const { data, error } = await base
        .in("unified_number", duplicateNumbers.slice(0, QUALITY_ISSUE_LIMIT))
        .limit(QUALITY_ISSUE_LIMIT);
      if (error) return err(fromSupabaseError(error));
      return ok((data ?? []).map(toIssueHolding));
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
