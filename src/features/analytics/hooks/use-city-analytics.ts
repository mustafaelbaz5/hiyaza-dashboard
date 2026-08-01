"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseAnalyticsRepository } from "../api/supabase-analytics-repository";
import { queryKeys } from "@/lib/query-keys";

/** Board 2 — per-city drilldown: headline stats. */
export function useCityDrilldown(cityId: string) {
  return useQuery({
    queryKey: queryKeys.analytics.cityDrilldown(cityId),
    queryFn: async () => {
      const repo = createSupabaseAnalyticsRepository(createClient());
      const result = await repo.getCityDrilldown(cityId);
      if (!result.ok) throw result.error;
      return result.value;
    },
    enabled: Boolean(cityId),
  });
}

/** Board 2 — basin breakdown for a city. */
export function useBasinBreakdown(cityId: string) {
  return useQuery({
    queryKey: ["analytics", "basins", cityId],
    queryFn: async () => {
      const repo = createSupabaseAnalyticsRepository(createClient());
      const result = await repo.getBasinBreakdown(cityId);
      if (!result.ok) throw result.error;
      return result.value;
    },
    enabled: Boolean(cityId),
  });
}

/** Board 2 — top holders by area for a city. */
export function useTopHolders(cityId: string, limit = 10) {
  return useQuery({
    queryKey: ["analytics", "top-holders", cityId, limit],
    queryFn: async () => {
      const repo = createSupabaseAnalyticsRepository(createClient());
      const result = await repo.getTopHolders(cityId, limit);
      if (!result.ok) throw result.error;
      return result.value;
    },
    enabled: Boolean(cityId),
  });
}
