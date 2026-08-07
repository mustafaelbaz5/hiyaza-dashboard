"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseAuditRepository } from "../api/supabase-audit-repository";

/** Full chronological edit history (newest first) for one holding — powers the Holding Details timeline. */
export function useHoldingEditHistory(holdingId: string) {
  return useQuery({
    queryKey: ["audit", "history", holdingId],
    queryFn: async () => {
      const repo = createSupabaseAuditRepository(createClient());
      const result = await repo.listHoldingEditHistory(holdingId);
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
}
