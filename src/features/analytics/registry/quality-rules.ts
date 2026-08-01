import type { QualityIssues } from "../types";

export interface QualityRule {
  key: keyof Omit<QualityIssues, "city_id">;
  label: string;
  severity: "error" | "warning";
}

/**
 * Each quality rule is a registered entry, not a switch statement (OCP, DASHBOARD_PLAN.md § 3.1)
 * — adding a rule means adding a row here and a column to city_quality_issues, never editing the
 * board component. Rules mirror the source file's بيانات ناقصة sheet but are recomputed live from
 * `holdings` so they stay correct for files that lack that sheet (§ 6.7).
 */
export const QUALITY_RULES: QualityRule[] = [
  { key: "missing_or_invalid_national_id", label: "رقم قومي مفقود أو غير صحيح", severity: "error" },
  { key: "placeholder_borders", label: "حدود القطعة قيم افتراضية (0)", severity: "warning" },
  { key: "zero_area", label: "مساحة صفرية", severity: "error" },
  { key: "missing_basin_code", label: "كود الحوض مفقود", severity: "warning" },
  { key: "duplicate_unified_number", label: "رقم موحد مكرر", severity: "error" },
];
