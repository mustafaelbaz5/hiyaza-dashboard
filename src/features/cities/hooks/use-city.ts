"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseCitiesRepository } from "../api/supabase-cities-repository";
import { queryKeys } from "@/lib/query-keys";

/** A single city by id — powers the city detail shell and its tabs. */
export function useCity(cityId: string) {
  return useQuery({
    queryKey: queryKeys.cities.detail(cityId),
    queryFn: async () => {
      const repo = createSupabaseCitiesRepository(createClient());
      const result = await repo.getById(cityId);
      if (!result.ok) throw result.error;
      return result.value;
    },
    enabled: Boolean(cityId),
  });
}
