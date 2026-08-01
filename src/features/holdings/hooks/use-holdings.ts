"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseHoldingsRepository } from "../api/supabase-holdings-repository";
import { queryKeys } from "@/lib/query-keys";
import type { HoldingsListParams } from "../types";

/** Server-paginated, server-filtered holdings for a city — never fetches the whole table. */
export function useHoldings(params: HoldingsListParams) {
  return useQuery({
    queryKey: queryKeys.holdings.list(params.cityId, {
      filters: params.filters,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
    }),
    queryFn: async () => {
      const repo = createSupabaseHoldingsRepository(createClient());
      const result = await repo.list(params);
      if (!result.ok) throw result.error;
      return result.value;
    },
    enabled: Boolean(params.cityId),
  });
}
