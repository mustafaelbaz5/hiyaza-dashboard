import type { Database } from "@/lib/supabase/database.types";

export type AppRole = Database["public"]["Enums"]["user_role"];

export interface DashboardProfile {
  id: string;
  email: string;
  displayName: string;
  role: AppRole;
  isActive: boolean;
}

export interface AuthRepository {
  signInWithPassword(email: string, password: string): Promise<import("@/lib/result").Result<void, import("@/lib/errors").AppError>>;
  signOut(): Promise<import("@/lib/result").Result<void, import("@/lib/errors").AppError>>;
  getCurrentProfile(): Promise<import("@/lib/result").Result<DashboardProfile | null, import("@/lib/errors").AppError>>;
}
