/** Central registry of table/bucket/role names so no magic string is duplicated across features. */
export const TABLES = {
  profiles: "profiles",
  cities: "cities",
  holdings: "holdings",
  holdingEdits: "holding_edits",
  addedHoldings: "added_holdings",
  importBatches: "import_batches",
  qualitySnapshots: "quality_snapshots",
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
