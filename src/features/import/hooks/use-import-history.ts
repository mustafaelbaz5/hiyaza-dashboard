"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseImportRepository } from "../api/supabase-import-repository";
import { queryKeys } from "@/lib/query-keys";

/** Import batch history for a city — powers the Imports tab and rollback UI. */
export function useImportHistory(cityId: string) {
  return useQuery({
    queryKey: queryKeys.imports.history(cityId),
    queryFn: async () => {
      const repo = createSupabaseImportRepository(createClient());
      const result = await repo.listBatches(cityId);
      if (!result.ok) throw result.error;
      return result.value;
    },
    enabled: Boolean(cityId),
  });
}
