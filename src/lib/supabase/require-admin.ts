import { createClient } from "./server";
import { TABLES } from "@/lib/constants";

/**
 * Verifies the current request's session belongs to an active admin before a Route Handler is
 * allowed to use the service-role client — service-role bypasses RLS entirely, so this check is
 * the only thing standing between an unauthenticated request and a privileged Admin API call.
 */
export async function requireAdmin(): Promise<{ userId: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from(TABLES.profiles)
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active || profile.role !== "admin") return null;

  return { userId: user.id };
}
