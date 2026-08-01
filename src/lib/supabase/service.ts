import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Service-role client — the ONLY file that uses SUPABASE_SERVICE_ROLE_KEY. Bypasses RLS
 * entirely, so it must only be imported from Route Handlers that have already verified the
 * caller is an authenticated admin (see /api/users/*). Never import this into a client
 * component or any code that ships to the browser.
 */
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
