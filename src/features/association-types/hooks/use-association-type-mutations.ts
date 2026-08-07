"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseAssociationTypesRepository } from "../api/supabase-association-types-repository";
import { queryKeys } from "@/lib/query-keys";
import type { CreateAssociationTypeInput, UpdateAssociationTypeInput } from "../types";

/** Creates a new association type — becomes selectable in the city form immediately, no deploy needed. */
export function useCreateAssociationType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAssociationTypeInput) => {
      const repo = createSupabaseAssociationTypesRepository(createClient());
      const result = await repo.create(input);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.associationTypes.all });
    },
  });
}

/** Edits a type's labels/sort order. The code itself (the FK target) is never editable after creation. */
export function useUpdateAssociationType(code: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateAssociationTypeInput) => {
      const repo = createSupabaseAssociationTypesRepository(createClient());
      const result = await repo.update(code, input);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.associationTypes.all });
    },
  });
}

/**
 * Deletes an association type. The database refuses this (foreign key restrict on
 * cities.association_type_code) if any city currently uses it — there is no cascade path.
 */
export function useDeleteAssociationType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const repo = createSupabaseAssociationTypesRepository(createClient());
      const result = await repo.delete(code);
      if (!result.ok) throw result.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.associationTypes.all });
    },
  });
}
