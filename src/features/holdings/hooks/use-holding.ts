"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseHoldingsRepository } from "../api/supabase-holdings-repository";
import { queryKeys } from "@/lib/query-keys";

/** A single holding by id — powers the Holding Details page. */
export function useHolding(holdingId: string) {
  return useQuery({
    queryKey: queryKeys.holdings.detail(holdingId),
    queryFn: async () => {
      const repo = createSupabaseHoldingsRepository(createClient());
      const result = await repo.getById(holdingId);
      if (!result.ok) throw result.error;
      return result.value;
    },
    enabled: Boolean(holdingId),
  });
}
