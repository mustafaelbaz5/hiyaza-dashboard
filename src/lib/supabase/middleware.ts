import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

const PUBLIC_ROUTES = ["/login"];

/**
 * Refreshes the Supabase session on every request; without this, Server Component sessions
 * silently expire. The route *guard* (redirect unauthenticated users to /login) is added in
 * Phase 1 once real auth exists — see DASHBOARD_PLAN.md § 8 Phase 0 vs Phase 1.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}

/** Exported for Phase 1: which routes remain reachable without an authenticated session. */
export { PUBLIC_ROUTES };
