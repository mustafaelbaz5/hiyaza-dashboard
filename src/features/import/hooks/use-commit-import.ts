"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseImportRepository } from "../api/supabase-import-repository";
import { queryKeys } from "@/lib/query-keys";
import type { CommitImportInput } from "../types";

/** Commits a previewed import — the only mutation that ever writes to `holdings`. */
export function useCommitImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CommitImportInput) => {
      const repo = createSupabaseImportRepository(createClient());
      const result = await repo.commitImport(input);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.imports.history(variables.cityId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.holdings.list(variables.cityId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.cities.detail(variables.cityId) });
    },
  });
}
