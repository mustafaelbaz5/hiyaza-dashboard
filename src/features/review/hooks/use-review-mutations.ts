"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseReviewRepository } from "../api/supabase-review-repository";
import { queryKeys } from "@/lib/query-keys";
import type { AddedHolding, ApproveInput, RejectInput } from "../types";

/** Approves a field-added record — promotes it into `holdings` atomically via RPC. */
export function useApproveAddedHolding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ApproveInput) => {
      const repo = createSupabaseReviewRepository(createClient());
      const result = await repo.approve(input);
      if (!result.ok) throw result.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.holdings.all });
    },
  });
}

/** Rejects a field-added record with a reason — never deleted, stays visible for audit. */
export function useRejectAddedHolding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RejectInput) => {
      const repo = createSupabaseReviewRepository(createClient());
      const result = await repo.reject(input);
      if (!result.ok) throw result.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review"] });
    },
  });
}

/** Edits a field-added record's fields before approval ("edit-then-approve"). */
export function useUpdateAddedHoldingFields() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, fields }: { id: string; fields: Partial<AddedHolding> }) => {
      const repo = createSupabaseReviewRepository(createClient());
      const result = await repo.updateFields(id, fields);
      if (!result.ok) throw result.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review"] });
    },
  });
}
