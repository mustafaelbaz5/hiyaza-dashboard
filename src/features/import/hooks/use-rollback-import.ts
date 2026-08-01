"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseImportRepository } from "../api/supabase-import-repository";
import { queryKeys } from "@/lib/query-keys";

/** Reverts a city to its previous import batch — deletes this batch's holdings, un-stales the last one. */
export function useRollbackImport(cityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (batchId: string) => {
      const repo = createSupabaseImportRepository(createClient());
      const result = await repo.rollbackBatch(batchId);
      if (!result.ok) throw result.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.imports.history(cityId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.holdings.list(cityId) });
    },
  });
}
