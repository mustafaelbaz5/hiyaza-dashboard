import type { Result } from "@/lib/result";
import type { AppError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

export type SystemOverview = Database["public"]["Views"]["system_overview"]["Row"];
export type CityDrilldown = Database["public"]["Functions"]["city_drilldown"]["Returns"][number];
export type CityStatusBreakdown = Database["public"]["Functions"]["city_status_breakdown"]["Returns"][number];
export type BasinBreakdown = Database["public"]["Views"]["city_basin_breakdown"]["Row"];
export type TopHolder = Database["public"]["Views"]["city_top_holders"]["Row"];
export type FieldCompleteness = Database["public"]["Views"]["city_field_completeness"]["Row"];
export type QualityIssues = Database["public"]["Views"]["city_quality_issues"]["Row"];
export type TeamActivityRow = Database["public"]["Views"]["team_activity"]["Row"];
export type QualitySnapshot = Database["public"]["Tables"]["quality_snapshots"]["Row"];

export interface QualityIssueHolding {
  id: string;
  holdingIdNumber: string | null;
  holderName: string | null;
}

export interface AnalyticsRepository {
  getSystemOverview(): Promise<Result<SystemOverview | null, AppError>>;
  getCityDrilldown(cityId: string): Promise<Result<CityDrilldown | null, AppError>>;
  getCityStatusBreakdown(cityId: string): Promise<Result<CityStatusBreakdown | null, AppError>>;
  getBasinBreakdown(cityId: string): Promise<Result<BasinBreakdown[], AppError>>;
  getTopHolders(cityId: string, limit: number): Promise<Result<TopHolder[], AppError>>;
  getFieldCompleteness(cityId?: string): Promise<Result<FieldCompleteness[], AppError>>;
  getQualityIssues(cityId?: string): Promise<Result<QualityIssues[], AppError>>;
  /** The actual holdings affected by one quality rule, for the "make it actionable" drill-down. */
  getQualityIssueHoldings(
    cityId: string,
    ruleKey: keyof Omit<QualityIssues, "city_id">,
  ): Promise<Result<QualityIssueHolding[], AppError>>;
  getTeamActivity(): Promise<Result<TeamActivityRow[], AppError>>;
  captureQualitySnapshot(cityId: string): Promise<Result<QualitySnapshot, AppError>>;
  getQualitySnapshotHistory(cityId: string): Promise<Result<QualitySnapshot[], AppError>>;
}
