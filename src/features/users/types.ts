import type { Result } from "@/lib/result";
import type { AppError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

export type AppRole = Database["public"]["Enums"]["user_role"];

export interface DashboardUser {
  id: string;
  email: string;
  displayName: string;
  role: AppRole;
  isActive: boolean;
  createdAt: string;
}

export interface InviteUserInput {
  email: string;
  displayName: string;
  role: Exclude<AppRole, "field">;
}

export interface UsersRepository {
  list(): Promise<Result<DashboardUser[], AppError>>;
  setRole(userId: string, role: AppRole): Promise<Result<void, AppError>>;
  setActive(userId: string, isActive: boolean): Promise<Result<void, AppError>>;
  invite(input: InviteUserInput): Promise<Result<void, AppError>>;
  forceSignOut(userId: string): Promise<Result<void, AppError>>;
  sendPasswordReset(email: string): Promise<Result<void, AppError>>;
}
