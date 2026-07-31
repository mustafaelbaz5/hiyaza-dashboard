"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseAuthRepository } from "../api/supabase-auth-repository";
import { queryKeys } from "@/lib/query-keys";

/** The signed-in dashboard user's profile, or null if unauthenticated — never fetches raw fields itself. */
export function useCurrentProfile() {
  return useQuery({
    queryKey: queryKeys.profile.current,
    queryFn: async () => {
      const repo = createSupabaseAuthRepository(createClient());
      const result = await repo.getCurrentProfile();
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
}
