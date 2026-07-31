"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseCitiesRepository } from "../api/supabase-cities-repository";
import { queryKeys } from "@/lib/query-keys";
import type { CityStatus, CreateCityInput, UpdateCityInput } from "../types";

/** Creates a city; invalidates the list so it appears immediately. */
export function useCreateCity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCityInput) => {
      const repo = createSupabaseCitiesRepository(createClient());
      const result = await repo.create(input);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cities.all });
    },
  });
}

/** Edits a city's identifying fields. */
export function useUpdateCity(cityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateCityInput) => {
      const repo = createSupabaseCitiesRepository(createClient());
      const result = await repo.update(cityId, input);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cities.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cities.detail(cityId) });
    },
  });
}

/** Moves a city through draft -> published -> archived. Archiving never deletes holdings. */
export function useSetCityStatus(cityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (status: CityStatus) => {
      const repo = createSupabaseCitiesRepository(createClient());
      const result = await repo.setStatus(cityId, status);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cities.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cities.detail(cityId) });
    },
  });
}
