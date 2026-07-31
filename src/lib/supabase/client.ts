import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/** One of the two sanctioned createClient call sites (browser side) — see DASHBOARD_PLAN.md § 3.1. */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
