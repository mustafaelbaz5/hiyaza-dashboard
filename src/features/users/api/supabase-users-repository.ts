import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { ok, err } from "@/lib/result";
import { fromSupabaseError } from "@/lib/errors";
import { TABLES } from "@/lib/constants";
import type { AppRole, DashboardUser, InviteUserInput, UsersRepository } from "../types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

function toDashboardUser(row: ProfileRow): DashboardUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error ?? "فشل الطلب");
  return json;
}

/**
 * Users repository. Role/active changes go through the regular RLS-enforced client (the
 * `profiles_admin_write` policy already gates them to admins); invite and force-sign-out need
 * the Auth Admin API, which only exists server-side — those two call Route Handlers instead.
 */
export function createSupabaseUsersRepository(
  supabase: SupabaseClient<Database>,
): UsersRepository {
  return {
    async list() {
      const { data, error } = await supabase
        .from(TABLES.profiles)
        .select("*")
        .neq("role", "field")
        .order("created_at", { ascending: false });
      if (error) return err(fromSupabaseError(error));
      return ok(data.map(toDashboardUser));
    },

    async setRole(userId: string, role: AppRole) {
      const { error } = await supabase.from(TABLES.profiles).update({ role }).eq("id", userId);
      if (error) return err(fromSupabaseError(error));
      return ok(undefined);
    },

    async setActive(userId: string, isActive: boolean) {
      const { error } = await supabase
        .from(TABLES.profiles)
        .update({ is_active: isActive })
        .eq("id", userId);
      if (error) return err(fromSupabaseError(error));
      return ok(undefined);
    },

    async invite(input: InviteUserInput) {
      try {
        await postJson("/api/users/invite", input);
        return ok(undefined);
      } catch (e) {
        return err({ code: "unknown", message: (e as Error).message });
      }
    },

    async forceSignOut(userId: string) {
      try {
        await postJson("/api/users/force-sign-out", { userId });
        return ok(undefined);
      } catch (e) {
        return err({ code: "unknown", message: (e as Error).message });
      }
    },

    async sendPasswordReset(email: string) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return err(fromSupabaseError(error));
      return ok(undefined);
    },
  };
}
