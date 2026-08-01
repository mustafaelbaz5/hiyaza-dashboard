"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseAnalyticsRepository } from "../api/supabase-analytics-repository";
import { queryKeys } from "@/lib/query-keys";

/** Board 1 — system overview across all cities. */
export function useSystemOverview() {
  return useQuery({
    queryKey: queryKeys.analytics.systemOverview,
    queryFn: async () => {
      const repo = createSupabaseAnalyticsRepository(createClient());
      const result = await repo.getSystemOverview();
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
}
