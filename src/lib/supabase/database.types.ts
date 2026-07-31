/**
 * GENERATED FILE — do not hand-edit.
 * Hand-authored to match supabase/migrations/*.sql until a live Supabase project exists;
 * regenerate with `supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts`
 * once one does, and this file becomes truly generated.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRole = "admin" | "editor" | "viewer" | "field";
export type CityStatus = "draft" | "published" | "archived";
export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: AppRole;
          is_disabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string; email: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      cities: {
        Row: {
          id: string;
          name: string;
          governorate: string | null;
          directorate: string | null;
          status: CityStatus;
          association_name: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          archived_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["cities"]["Row"]> & { name: string };
        Update: Partial<Database["public"]["Tables"]["cities"]["Row"]>;
      };
      holdings: {
        Row: {
          id: string;
          city_id: string;
          holding_id_number: string | null;
          unified_number: string | null;
          land_number: string | null;
          page_number: string | null;
          basin_code: string | null;
          basin_name: string | null;
          holder_name: string | null;
          national_id: string | null;
          area_feddan: number;
          area_qirat: number;
          area_sahm: number;
          area_sqm: number;
          border_east: string | null;
          border_west: string | null;
          border_south: string | null;
          border_north: string | null;
          association_name: string | null;
          directorate: string | null;
          governorate: string | null;
          import_batch_id: string | null;
          is_stale: boolean;
          source_row_number: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["holdings"]["Row"]> & { city_id: string };
        Update: Partial<Database["public"]["Tables"]["holdings"]["Row"]>;
      };
      holding_edits: {
        Row: {
          id: string;
          holding_id: string;
          field_name: string;
          old_value: string | null;
          new_value: string | null;
          edited_by: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["holding_edits"]["Row"]> & {
          holding_id: string;
          field_name: string;
          edited_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["holding_edits"]["Row"]>;
      };
      added_holdings: {
        Row: {
          id: string;
          city_id: string;
          holder_name: string;
          national_id: string | null;
          basin_code: string | null;
          basin_name: string | null;
          land_number: string | null;
          page_number: string | null;
          area_feddan: number;
          area_qirat: number;
          area_sahm: number;
          notes: string | null;
          status: ReviewStatus;
          created_by: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          promoted_holding_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["added_holdings"]["Row"]> & {
          city_id: string;
          holder_name: string;
          created_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["added_holdings"]["Row"]>;
      };
      import_batches: {
        Row: {
          id: string;
          city_id: string;
          file_name: string;
          storage_path: string | null;
          status: string;
          rows_total: number;
          rows_imported: number;
          rows_rejected: number;
          rejection_log: Json | null;
          mapping_used: Json | null;
          imported_by: string;
          created_at: string;
          committed_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["import_batches"]["Row"]> & {
          city_id: string;
          file_name: string;
          imported_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["import_batches"]["Row"]>;
      };
      quality_snapshots: {
        Row: {
          id: string;
          city_id: string;
          captured_at: string;
          overall_score: number;
          field_completeness: Json;
          issue_counts: Json;
        };
        Insert: Partial<Database["public"]["Tables"]["quality_snapshots"]["Row"]> & {
          city_id: string;
          overall_score: number;
          field_completeness: Json;
          issue_counts: Json;
        };
        Update: Partial<Database["public"]["Tables"]["quality_snapshots"]["Row"]>;
      };
    };
    Views: {
      system_overview: {
        Row: {
          total_cities: number;
          draft_cities: number;
          published_cities: number;
          archived_cities: number;
          total_holdings: number;
          total_distinct_people: number;
          total_area_feddan: number;
          total_area_qirat: number;
          total_area_sahm: number;
          total_area_sqm: number;
          cities_never_imported: number;
          cities_stale_90d: number;
          pending_reviews: number;
        };
      };
      city_basin_breakdown: {
        Row: {
          city_id: string;
          basin_name: string;
          holdings_count: number;
          total_area_feddan: number;
          total_area_sqm: number;
        };
      };
      city_top_holders: {
        Row: {
          city_id: string;
          holder_name: string;
          national_id: string | null;
          holdings_count: number;
          total_area_feddan: number;
        };
      };
      city_field_completeness: {
        Row: {
          city_id: string;
          total_rows: number;
          national_id_pct: number;
          basin_code_pct: number;
          area_pct: number;
          unified_number_pct: number;
          holder_name_pct: number;
        };
      };
      city_quality_issues: {
        Row: {
          city_id: string;
          missing_or_invalid_national_id: number;
          placeholder_borders: number;
          zero_area: number;
          missing_basin_code: number;
          duplicate_unified_number: number;
        };
      };
      team_activity: {
        Row: {
          user_id: string;
          full_name: string | null;
          email: string;
          role: AppRole;
          records_added: number;
          edits_made: number;
          cities_touched: number;
          approval_rate: number;
          last_active_at: string | null;
        };
      };
    };
    Functions: {
      city_drilldown: {
        Args: { p_city_id: string };
        Returns: {
          holdings_count: number;
          total_area_feddan: number;
          total_area_qirat: number;
          total_area_sahm: number;
          total_area_sqm: number;
          added_holdings_count: number;
          last_import_at: string | null;
          last_edit_at: string | null;
        }[];
      };
    };
    Enums: {
      app_role: AppRole;
      city_status: CityStatus;
      review_status: ReviewStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
