import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";
import { TABLES } from "@/lib/constants";

const PUBLIC_ROUTES = ["/login"];

/**
 * Refreshes the Supabase session on every request and guards every non-public route: no
 * session, a disabled profile, or the `field` role (mobile-app-only, DASHBOARD_PLAN.md § 6.1)
 * all redirect to /login. Authorization is still enforced by RLS underneath — this is only the
 * UI-level courtesy redirect.
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicRoute = PUBLIC_ROUTES.some((route) => request.nextUrl.pathname.startsWith(route));

  if (isPublicRoute) {
    return supabaseResponse;
  }

  if (!user) {
    return redirectToLogin(request);
  }

  const { data: profile } = await supabase
    .from(TABLES.profiles)
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  const canAccessDashboard = profile && profile.is_active && profile.role !== "field";
  if (!canAccessDashboard) {
    await supabase.auth.signOut();
    return redirectToLogin(request);
  }

  return supabaseResponse;
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  return NextResponse.redirect(loginUrl);
}

export { PUBLIC_ROUTES };
