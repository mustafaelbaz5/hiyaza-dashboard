"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseHoldingsRepository } from "../api/supabase-holdings-repository";
import { queryKeys } from "@/lib/query-keys";
import type { ApplyEditInput, BulkApplyFieldInput } from "../types";

/** Writes a single-field correction as a new holding_edits row — never mutates `holdings`. */
export function useApplyHoldingEdit(cityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ApplyEditInput) => {
      const repo = createSupabaseHoldingsRepository(createClient());
      const result = await repo.applyEdit(input);
      if (!result.ok) throw result.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.holdings.all });
      queryClient.invalidateQueries({ queryKey: ["holdings", "basins", cityId] });
    },
  });
}

/** Applies one field's value to many holdings at once — mirrors the app's bulkApplyField. */
export function useBulkApplyField(cityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: BulkApplyFieldInput) => {
      const repo = createSupabaseHoldingsRepository(createClient());
      const result = await repo.bulkApplyField(input);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.holdings.all });
      queryClient.invalidateQueries({ queryKey: ["holdings", "basins", cityId] });
    },
  });
}
