"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseAssociationTypesRepository } from "../api/supabase-association-types-repository";
import { queryKeys } from "@/lib/query-keys";

/** All association types, sorted by display order — the registry backing cities.association_type_code. */
export function useAssociationTypes() {
  return useQuery({
    queryKey: queryKeys.associationTypes.all,
    queryFn: async () => {
      const repo = createSupabaseAssociationTypesRepository(createClient());
      const result = await repo.list();
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
}
