"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseAuditRepository } from "../api/supabase-audit-repository";

/** Field-level before/after diff for one holding_edits row — fetched on row expand. */
export function useHoldingEditDiff(holdingId: string, editId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["audit", "diff", holdingId, editId],
    queryFn: async () => {
      const repo = createSupabaseAuditRepository(createClient());
      const result = await repo.getHoldingEditDiff(holdingId, editId);
      if (!result.ok) throw result.error;
      return result.value;
    },
    enabled,
  });
}
