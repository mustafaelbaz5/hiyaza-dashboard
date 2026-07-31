"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseCitiesRepository } from "../api/supabase-cities-repository";
import { queryKeys } from "@/lib/query-keys";

/** All cities with holdings/import stats — powers the cities list page. */
export function useCities() {
  return useQuery({
    queryKey: queryKeys.cities.list(),
    queryFn: async () => {
      const repo = createSupabaseCitiesRepository(createClient());
      const result = await repo.list();
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
}
