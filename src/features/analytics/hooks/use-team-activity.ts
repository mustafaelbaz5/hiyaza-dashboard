"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseAnalyticsRepository } from "../api/supabase-analytics-repository";
import { queryKeys } from "@/lib/query-keys";

/** Board 4 — per-user activity leaderboard. */
export function useTeamActivity() {
  return useQuery({
    queryKey: queryKeys.analytics.teamActivity,
    queryFn: async () => {
      const repo = createSupabaseAnalyticsRepository(createClient());
      const result = await repo.getTeamActivity();
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
}
