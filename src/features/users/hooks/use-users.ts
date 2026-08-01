"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseUsersRepository } from "../api/supabase-users-repository";
import { queryKeys } from "@/lib/query-keys";

/** Dashboard staff list (admin/editor/viewer — field accounts belong to the mobile app only). */
export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: async () => {
      const repo = createSupabaseUsersRepository(createClient());
      const result = await repo.list();
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
}
