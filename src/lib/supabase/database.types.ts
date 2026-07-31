/**
 * GENERATED FILE — do not hand-edit.
 * Regenerate with: npx supabase gen types typescript --linked > src/lib/supabase/database.types.ts
 */
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
          holder_name: string
          holding_id_number: string | null
          id: string
          is_delegate: boolean
          is_inheritance: boolean
          land_number: string | null
          national_id: string | null
          notes: string | null
          owner_name: string | null
          page_number: string | null
          parent_holding_id: string | null
          promoted_holding_id: string | null
          qirat: number
          rejection_reason: string | null
          sahm: number
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
          holder_name: string
          holding_id_number?: string | null
          id?: string
          is_delegate?: boolean
          is_inheritance?: boolean
          land_number?: string | null
          national_id?: string | null
          notes?: string | null
          owner_name?: string | null
          page_number?: string | null
          parent_holding_id?: string | null
          promoted_holding_id?: string | null
          qirat?: number
          rejection_reason?: string | null
          sahm?: number
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
          holder_name?: string
          holding_id_number?: string | null
          id?: string
          is_delegate?: boolean
          is_inheritance?: boolean
          land_number?: string | null
          national_id?: string | null
          notes?: string | null
          owner_name?: string | null
          page_number?: string | null
          parent_holding_id?: string | null
          promoted_holding_id?: string | null
          qirat?: number
          rejection_reason?: string | null
          sahm?: number
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
        ]
      }
      cities: {
        Row: {
          administration: string | null
          created_at: string
          created_by: string | null
          data_version: number
          directorate: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["city_status"]
          updated_at: string
        }
        Insert: {
          administration?: string | null
          created_at?: string
          created_by?: string | null
          data_version?: number
          directorate?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["city_status"]
          updated_at?: string
        }
        Update: {
          administration?: string | null
          created_at?: string
          created_by?: string | null
          data_version?: number
          directorate?: string | null
          id?: string
          name?: string
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
          directorate?: string | null
          feddan?: number
          holder_name?: string | null
          holding_id_number?: string | null
          id?: string
          import_batch_id?: string | null
          imported_at?: string
          is_stale?: boolean
          land_number?: string | null
          national_id?: string | null
          page_number?: string | null
          qirat?: number
          sahm?: number
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
          directorate?: string | null
          feddan?: number
          holder_name?: string | null
          holding_id_number?: string | null
          id?: string
          import_batch_id?: string | null
          imported_at?: string
          is_stale?: boolean
          land_number?: string | null
          national_id?: string | null
          page_number?: string | null
          qirat?: number
          sahm?: number
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
    }
    Views: {
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
            foreignKeyName: "holding_edits_holding_id_fkey"
            columns: ["holding_id"]
            isOneToOne: false
            referencedRelation: "holdings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      current_role_is: {
        Args: { roles: Database["public"]["Enums"]["user_role"][] }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
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
