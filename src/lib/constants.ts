/** Central registry of table/bucket/role names so no magic string is duplicated across features. */
export const TABLES = {
  profiles: "profiles",
  cities: "cities",
  holdings: "holdings",
  holdingEdits: "holding_edits",
  holdingEditsLatest: "holding_edits_latest",
  addedHoldings: "added_holdings",
  importBatches: "import_batches",
  qualitySnapshots: "quality_snapshots",
  adminActions: "admin_actions",
  unifiedHoldingsExport: "unified_holdings_export",
} as const;

export const STORAGE_BUCKETS = {
  imports: "imports",
} as const;

export const ROLES = {
  admin: "admin",
  editor: "editor",
  viewer: "viewer",
  field: "field",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const CITY_STATUS = {
  draft: "draft",
  published: "published",
  archived: "archived",
} as const;

export type CityStatus = (typeof CITY_STATUS)[keyof typeof CITY_STATUS];

export const IMPORT_BATCH_STATUS = {
  pending: "pending",
  previewing: "previewing",
  committed: "committed",
  failed: "failed",
  rolledBack: "rolled_back",
} as const;

export const REVIEW_STATUS = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
} as const;

/**
 * Single source of truth for association type/subtype labels — the exact Arabic literals here
 * must match the `cities_subtype_valid` check constraint (supabase/migrations/
 * 20260801200000_city_association_type.sql) byte-for-byte. Copy from here into SQL, never
 * retype independently (Arabic strings are prone to invisible character-variant mismatches).
 */
export const ASSOCIATION_TYPE = {
  agriculturalCredit: "agricultural_credit",
  agriculturalReform: "agricultural_reform",
} as const;

export type AssociationType = (typeof ASSOCIATION_TYPE)[keyof typeof ASSOCIATION_TYPE];

export const ASSOCIATION_TYPE_LABELS: Record<AssociationType, string> = {
  agricultural_credit: "الائتمان الزراعي",
  agricultural_reform: "الإصلاح الزراعي",
};

export const ASSOCIATION_SUBTYPES: Record<AssociationType, readonly string[]> = {
  agricultural_credit: ["ملك", "اوقاف"],
  agricultural_reform: ["إصلاح مُملك", "إصلاح اشتراكي", "إصلاح قانون ثلاثة"],
};

/**
 * A separate, third city classification (distinct from association type/subtype above) — matches
 * the `city_classification` enum (supabase/migrations/
 * 20260801200600_cities_classification_and_short_code.sql) byte-for-byte.
 */
export const CITY_CLASSIFICATIONS = ["استصلاح", "ائتمان", "اصلاح"] as const;
export type CityClassification = (typeof CITY_CLASSIFICATIONS)[number];
