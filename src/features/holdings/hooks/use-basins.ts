"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseHoldingsRepository } from "../api/supabase-holdings-repository";

/** Distinct basin names for a city — powers the basin filter dropdown. */
export function useBasins(cityId: string) {
  return useQuery({
    queryKey: ["holdings", "basins", cityId],
    queryFn: async () => {
      const repo = createSupabaseHoldingsRepository(createClient());
      const result = await repo.listBasins(cityId);
      if (!result.ok) throw result.error;
      return result.value;
    },
    enabled: Boolean(cityId),
  });
}
