import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { ok, err, type Result } from "@/lib/result";
import { fromSupabaseError, type AppError } from "@/lib/errors";
import { TABLES } from "@/lib/constants";
import type { AuthRepository, DashboardProfile } from "../types";

/** Auth repository backed by a real Supabase client — the browser-side createClient() is injected. */
export function createSupabaseAuthRepository(
  supabase: SupabaseClient<Database>,
): AuthRepository {
  return {
    async signInWithPassword(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return err(fromSupabaseError(error));
      return ok(undefined);
    },

    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) return err(fromSupabaseError(error));
      return ok(undefined);
    },

    async getCurrentProfile(): Promise<Result<DashboardProfile | null, AppError>> {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return ok(null);

      const { data, error } = await supabase
        .from(TABLES.profiles)
        .select("id, email, display_name, role, is_active")
        .eq("id", user.id)
        .single();

      if (error) return err(fromSupabaseError(error));

      return ok({
        id: data.id,
        email: data.email,
        displayName: data.display_name,
        role: data.role,
        isActive: data.is_active,
      });
    },
  };
}
