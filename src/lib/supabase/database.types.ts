export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      added_holdings: {
        Row: {
          administration: string | null
          association_name: string | null
          basin_code: string | null
          basin_name: string | null
          border_east: string | null
          border_north: string | null
          border_south: string | null
          border_west: string | null
          city_id: string
          client_id: string
          created_at: string
          created_by: string
          credit_type: string
          crop_type: string | null
          directorate: string | null
          feddan: number
          growth_stages: string | null
          holder_name: string
          holder_name_farmer_card: string | null
          holding_id_number: string | null
          id: string
          is_delegate: boolean
          is_inheritance: boolean
          land_number: string | null
          national_id: string | null
          notes: string | null
          owner_name: string | null
          owner_name_farmer_card: string | null
          page_number: string | null
          parent_holding_id: string | null
          person_id: string | null
          promoted_holding_id: string | null
          qirat: number
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sahm: number
          soil_type: string | null
          status: Database["public"]["Enums"]["record_status"]
          total_sqm: number | null
          unified_number: string | null
          updated_at: string
          usage_type: string
        }
        Insert: {
          administration?: string | null
          association_name?: string | null
          basin_code?: string | null
          basin_name?: string | null
          border_east?: string | null
          border_north?: string | null
          border_south?: string | null
          border_west?: string | null
          city_id: string
          client_id: string
          created_at?: string
          created_by: string
          credit_type?: string
          crop_type?: string | null
          directorate?: string | null
          feddan?: number
          growth_stages?: string | null
          holder_name: string
          holder_name_farmer_card?: string | null
          holding_id_number?: string | null
          id?: string
          is_delegate?: boolean
          is_inheritance?: boolean
          land_number?: string | null
          national_id?: string | null
          notes?: string | null
          owner_name?: string | null
          owner_name_farmer_card?: string | null
          page_number?: string | null
          parent_holding_id?: string | null
          person_id?: string | null
          promoted_holding_id?: string | null
          qirat?: number
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sahm?: number
          soil_type?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          total_sqm?: number | null
          unified_number?: string | null
          updated_at?: string
          usage_type?: string
        }
        Update: {
          administration?: string | null
          association_name?: string | null
          basin_code?: string | null
          basin_name?: string | null
          border_east?: string | null
          border_north?: string | null
          border_south?: string | null
          border_west?: string | null
          city_id?: string
          client_id?: string
          created_at?: string
          created_by?: string
          credit_type?: string
          crop_type?: string | null
          directorate?: string | null
          feddan?: number
          growth_stages?: string | null
          holder_name?: string
          holder_name_farmer_card?: string | null
          holding_id_number?: string | null
          id?: string
          is_delegate?: boolean
          is_inheritance?: boolean
          land_number?: string | null
          national_id?: string | null
          notes?: string | null
          owner_name?: string | null
          owner_name_farmer_card?: string | null
          page_number?: string | null
          parent_holding_id?: string | null
          person_id?: string | null
          promoted_holding_id?: string | null
          qirat?: number
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sahm?: number
          soil_type?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          total_sqm?: number | null
          unified_number?: string | null
          updated_at?: string
          usage_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "added_holdings_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "added_holdings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "added_holdings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "team_activity"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "added_holdings_parent_holding_id_fkey"
            columns: ["parent_holding_id"]
            isOneToOne: false
            referencedRelation: "holdings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "added_holdings_promoted_holding_id_fkey"
            columns: ["promoted_holding_id"]
            isOneToOne: false
            referencedRelation: "holdings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "added_holdings_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "added_holdings_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "team_activity"
            referencedColumns: ["user_id"]
          },
        ]
      }
      admin_actions: {
        Row: {
          action_type: string
          actor_id: string | null
          created_at: string
          details: Json
          entity_id: string
          entity_name: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action_type: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id: string
          entity_name?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action_type?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string
          entity_name?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "team_activity"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cities: {
        Row: {
          administration: string | null
          association_subtype: string | null
          association_type: Database["public"]["Enums"]["association_type"] | null
          classification: Database["public"]["Enums"]["city_classification"] | null
          created_at: string
          created_by: string | null
          data_version: number
          directorate: string | null
          id: string
          name: string
          short_code: string | null
          status: Database["public"]["Enums"]["city_status"]
          updated_at: string
        }
        Insert: {
          administration?: string | null
          association_subtype?: string | null
          association_type?: Database["public"]["Enums"]["association_type"] | null
          classification?: Database["public"]["Enums"]["city_classification"] | null
          created_at?: string
          created_by?: string | null
          data_version?: number
          directorate?: string | null
          id?: string
          name: string
          short_code?: string | null
          status?: Database["public"]["Enums"]["city_status"]
          updated_at?: string
        }
        Update: {
          administration?: string | null
          association_subtype?: string | null
          association_type?: Database["public"]["Enums"]["association_type"] | null
          classification?: Database["public"]["Enums"]["city_classification"] | null
          created_at?: string
          created_by?: string | null
          data_version?: number
          directorate?: string | null
          id?: string
          name?: string
          short_code?: string | null
          status?: Database["public"]["Enums"]["city_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "team_activity"
            referencedColumns: ["user_id"]
          },
        ]
      }
      holding_edits: {
        Row: {
          city_id: string
          client_edited_at: string | null
          client_op_id: string | null
          device_id: string | null
          edited_at: string
          edited_by: string
          holding_id: string
          id: string
          payload: Json
        }
        Insert: {
          city_id: string
          client_edited_at?: string | null
          client_op_id?: string | null
          device_id?: string | null
          edited_at?: string
          edited_by: string
          holding_id: string
          id?: string
          payload: Json
        }
        Update: {
          city_id?: string
          client_edited_at?: string | null
          client_op_id?: string | null
          device_id?: string | null
          edited_at?: string
          edited_by?: string
          holding_id?: string
          id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "holding_edits_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holding_edits_edited_by_fkey"
            columns: ["edited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holding_edits_edited_by_fkey"
            columns: ["edited_by"]
            isOneToOne: false
            referencedRelation: "team_activity"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "holding_edits_holding_id_fkey"
            columns: ["holding_id"]
            isOneToOne: false
            referencedRelation: "holdings"
            referencedColumns: ["id"]
          },
        ]
      }
      holdings: {
        Row: {
          administration: string | null
          association_name: string | null
          basin_code: string | null
          basin_name: string | null
          border_east: string | null
          border_north: string | null
          border_south: string | null
          border_west: string | null
          city_id: string
          dedup_key: string | null
          directorate: string | null
          feddan: number
          growth_stages: string | null
          holder_name: string | null
          holder_name_farmer_card: string | null
          holding_id_number: string | null
          id: string
          import_batch_id: string | null
          imported_at: string
          is_stale: boolean
          land_number: string | null
          national_id: string | null
          owner_name_farmer_card: string | null
          page_number: string | null
          person_id: string | null
          qirat: number
          sahm: number
          soil_type: string | null
          total_sqm: number | null
          unified_number: string | null
        }
        Insert: {
          administration?: string | null
          association_name?: string | null
          basin_code?: string | null
          basin_name?: string | null
          border_east?: string | null
          border_north?: string | null
          border_south?: string | null
          border_west?: string | null
          city_id: string
          dedup_key?: string | null
          directorate?: string | null
          feddan?: number
          growth_stages?: string | null
          holder_name?: string | null
          holder_name_farmer_card?: string | null
          holding_id_number?: string | null
          id?: string
          import_batch_id?: string | null
          imported_at?: string
          is_stale?: boolean
          land_number?: string | null
          national_id?: string | null
          owner_name_farmer_card?: string | null
          page_number?: string | null
          person_id?: string | null
          qirat?: number
          sahm?: number
          soil_type?: string | null
          total_sqm?: number | null
          unified_number?: string | null
        }
        Update: {
          administration?: string | null
          association_name?: string | null
          basin_code?: string | null
          basin_name?: string | null
          border_east?: string | null
          border_north?: string | null
          border_south?: string | null
          border_west?: string | null
          city_id?: string
          dedup_key?: string | null
          directorate?: string | null
          feddan?: number
          growth_stages?: string | null
          holder_name?: string | null
          holder_name_farmer_card?: string | null
          holding_id_number?: string | null
          id?: string
          import_batch_id?: string | null
          imported_at?: string
          is_stale?: boolean
          land_number?: string | null
          national_id?: string | null
          owner_name_farmer_card?: string | null
          page_number?: string | null
          person_id?: string | null
          qirat?: number
          sahm?: number
          soil_type?: string | null
          total_sqm?: number | null
          unified_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "holdings_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holdings_import_batch_id_fkey"
            columns: ["import_batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      import_batches: {
        Row: {
          city_id: string
          committed_at: string | null
          created_at: string
          file_name: string
          id: string
          imported_by: string
          mapping_used: Json | null
          rejection_log: Json | null
          rows_imported: number
          rows_rejected: number
          rows_total: number
          status: string
          storage_path: string | null
        }
        Insert: {
          city_id: string
          committed_at?: string | null
          created_at?: string
          file_name: string
          id?: string
          imported_by: string
          mapping_used?: Json | null
          rejection_log?: Json | null
          rows_imported?: number
          rows_rejected?: number
          rows_total?: number
          status?: string
          storage_path?: string | null
        }
        Update: {
          city_id?: string
          committed_at?: string | null
          created_at?: string
          file_name?: string
          id?: string
          imported_by?: string
          mapping_used?: Json | null
          rejection_log?: Json | null
          rows_imported?: number
          rows_rejected?: number
          rows_total?: number
          status?: string
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "import_batches_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_batches_imported_by_fkey"
            columns: ["imported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_batches_imported_by_fkey"
            columns: ["imported_by"]
            isOneToOne: false
            referencedRelation: "team_activity"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          display_name: string
          email: string
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      quality_snapshots: {
        Row: {
          captured_at: string
          city_id: string
          field_completeness: Json
          id: string
          issue_counts: Json
          overall_score: number
        }
        Insert: {
          captured_at?: string
          city_id: string
          field_completeness: Json
          id?: string
          issue_counts: Json
          overall_score: number
        }
        Update: {
          captured_at?: string
          city_id?: string
          field_completeness?: Json
          id?: string
          issue_counts?: Json
          overall_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "quality_snapshots_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      audit_feed: {
        Row: {
          city_id: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          occurred_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      city_basin_breakdown: {
        Row: {
          basin_name: string | null
          city_id: string | null
          holdings_count: number | null
          total_feddan: number | null
          total_sqm: number | null
        }
        Relationships: [
          {
            foreignKeyName: "holdings_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_holdings_export: {
        Row: {
          added_notes: string | null
          administration: string | null
          association_name: string | null
          association_subtype: string | null
          association_type: Database["public"]["Enums"]["association_type"] | null
          basin_code: string | null
          basin_name: string | null
          border_east: string | null
          border_north: string | null
          border_south: string | null
          border_west: string | null
          city_id: string | null
          city_name: string | null
          classification: Database["public"]["Enums"]["city_classification"] | null
          client_id: string | null
          credit_type: string | null
          crop_type: string | null
          dedup_key: string | null
          directorate: string | null
          feddan: number | null
          growth_stages: string | null
          holder_name: string | null
          holder_name_farmer_card: string | null
          holding_id_number: string | null
          id: string | null
          import_batch_id: string | null
          imported_at: string | null
          is_delegate: boolean | null
          is_inheritance: boolean | null
          is_stale: boolean | null
          land_number: string | null
          latest_edit_payload: Json | null
          legacy_edit_key: string | null
          national_id: string | null
          owner_name: string | null
          owner_name_farmer_card: string | null
          page_number: string | null
          person_id: string | null
          qirat: number | null
          sahm: number | null
          short_code: string | null
          soil_type: string | null
          total_sqm: number | null
          unified_number: string | null
          usage_type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "holdings_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      city_field_completeness: {
        Row: {
          area_pct: number | null
          basin_code_pct: number | null
          city_id: string | null
          holder_name_pct: number | null
          national_id_pct: number | null
          total_rows: number | null
          unified_number_pct: number | null
        }
        Relationships: [
          {
            foreignKeyName: "holdings_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      city_quality_issues: {
        Row: {
          city_id: string | null
          duplicate_unified_number: number | null
          missing_basin_code: number | null
          missing_or_invalid_national_id: number | null
          placeholder_borders: number | null
          zero_area: number | null
        }
        Relationships: [
          {
            foreignKeyName: "holdings_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      city_top_holders: {
        Row: {
          city_id: string | null
          holder_name: string | null
          holdings_count: number | null
          national_id: string | null
          total_feddan: number | null
        }
        Relationships: [
          {
            foreignKeyName: "holdings_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      holding_edits_latest: {
        Row: {
          city_id: string | null
          client_edited_at: string | null
          device_id: string | null
          edited_at: string | null
          edited_by: string | null
          holding_id: string | null
          id: string | null
          payload: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "holding_edits_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holding_edits_edited_by_fkey"
            columns: ["edited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holding_edits_edited_by_fkey"
            columns: ["edited_by"]
            isOneToOne: false
            referencedRelation: "team_activity"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "holding_edits_holding_id_fkey"
            columns: ["holding_id"]
            isOneToOne: false
            referencedRelation: "holdings"
            referencedColumns: ["id"]
          },
        ]
      }
      system_overview: {
        Row: {
          active_users_30d: number | null
          active_users_7d: number | null
          archived_cities: number | null
          cities_never_imported: number | null
          cities_stale_90d: number | null
          draft_cities: number | null
          pending_reviews: number | null
          published_cities: number | null
          total_cities: number | null
          total_distinct_people: number | null
          total_feddan: number | null
          total_holdings: number | null
          total_qirat: number | null
          total_sahm: number | null
          total_sqm: number | null
        }
        Relationships: []
      }
      team_activity: {
        Row: {
          approval_rate: number | null
          cities_touched: number | null
          display_name: string | null
          edits_made: number | null
          email: string | null
          last_active_at: string | null
          records_added: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          user_id: string | null
        }
        Insert: {
          approval_rate?: never
          cities_touched?: never
          display_name?: string | null
          edits_made?: never
          email?: string | null
          last_active_at?: never
          records_added?: never
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string | null
        }
        Update: {
          approval_rate?: never
          cities_touched?: never
          display_name?: string | null
          edits_made?: never
          email?: string | null
          last_active_at?: never
          records_added?: never
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_added_holding: {
        Args: { p_added_holding_id: string; p_holding_id_number: string }
        Returns: {
          administration: string | null
          association_name: string | null
          basin_code: string | null
          basin_name: string | null
          border_east: string | null
          border_north: string | null
          border_south: string | null
          border_west: string | null
          city_id: string
          dedup_key: string | null
          directorate: string | null
          feddan: number
          holder_name: string | null
          holding_id_number: string | null
          id: string
          import_batch_id: string | null
          imported_at: string
          is_stale: boolean
          land_number: string | null
          national_id: string | null
          page_number: string | null
          qirat: number
          sahm: number
          total_sqm: number | null
          unified_number: string | null
        }
        SetofOptions: {
          from: "*"
          to: "holdings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      capture_quality_snapshot: {
        Args: { p_city_id: string }
        Returns: {
          captured_at: string
          city_id: string
          field_completeness: Json
          id: string
          issue_counts: Json
          overall_score: number
        }
        SetofOptions: {
          from: "*"
          to: "quality_snapshots"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      city_drilldown: {
        Args: { p_city_id: string }
        Returns: {
          added_holdings_count: number
          holdings_count: number
          last_edit_at: string
          last_import_at: string
          total_feddan: number
          total_qirat: number
          total_sahm: number
          total_sqm: number
        }[]
      }
      delete_city_cascade: {
        Args: { p_city_id: string }
        Returns: undefined
      }
      commit_import_batch: {
        Args: {
          p_city_id: string
          p_file_name: string
          p_mapping_used: Json
          p_records: Json
          p_rows_skipped_blank: number
          p_rows_total: number
          p_storage_path: string
        }
        Returns: Json
      }
      current_role_is: {
        Args: { roles: Database["public"]["Enums"]["user_role"][] }
        Returns: boolean
      }
      reject_added_holding: {
        Args: { p_added_holding_id: string; p_reason: string }
        Returns: undefined
      }
      rollback_import_batch: {
        Args: { p_batch_id: string }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      association_type: "agricultural_credit" | "agricultural_reform"
      city_classification: "استصلاح" | "ائتمان" | "اصلاح"
      city_status: "draft" | "published" | "archived"
      record_status: "pending" | "approved" | "rejected"
      user_role: "admin" | "editor" | "viewer" | "field"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      city_status: ["draft", "published", "archived"],
      record_status: ["pending", "approved", "rejected"],
      user_role: ["admin", "editor", "viewer", "field"],
    },
  },
} as const
