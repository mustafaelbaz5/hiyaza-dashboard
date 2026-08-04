import type { Result } from "@/lib/result";
import type { AppError } from "@/lib/errors";
import type { AssociationType, CityClassification } from "@/lib/constants";
import type { Json } from "@/lib/supabase/database.types";

/** One raw row from the unified_holdings_export view — fully merged with all edits applied.
 * All fields reflect the latest state; no raw payloads. */
export interface UnifiedExportRow {
  id: string;
  city_id: string;
  import_batch_id: string | null;
  holding_id_number: string | null;
  unified_number: string | null;
  holder_name: string | null;
  national_id: string | null;
  land_number: string | null;
  page_number: string | null;
  basin_name: string | null;
  basin_code: string | null;
  association_name: string | null;
  administration: string | null;
  directorate: string | null;
  border_east: string | null;
  border_west: string | null;
  border_south: string | null;
  border_north: string | null;
  feddan: number;
  qirat: number;
  sahm: number;
  total_sqm: number | null;
  is_stale: boolean;
  imported_at: string | null;
  dedup_key: string | null;
  soil_type: string | null;
  growth_stages: string | null;
  holder_name_farmer_card: string | null;
  owner_name_farmer_card: string | null;
  person_id: string | null;
  credit_type: string | null;
  crop_type: string | null;
  is_delegate: boolean | null;
  is_inheritance: boolean | null;
  notes: string | null;
  owner_name: string | null;
  usage_type: string | null;
  reform_type: string | null;
  created_at: string;
  updated_at: string;
  city_name: string | null;
  association_type: AssociationType | null;
  association_subtype: string | null;
  classification: CityClassification | null;
  short_code: string | null;
}

/** Open filter object — only cityId is wired in the repository today; the rest are reserved so
 * future filtering (review status, association, custom) never requires touching the dataset
 * builder or Excel mapper, only the repository's query. */
export interface ExportFilters {
  cityId?: string;
  userId?: string;
  reviewStatus?: string;
  approvalStatus?: string;
  associationType?: AssociationType;
  custom?: Record<string, unknown>;
}

export interface ExportRepository {
  list(filters: ExportFilters): Promise<Result<UnifiedExportRow[], AppError>>;
}
