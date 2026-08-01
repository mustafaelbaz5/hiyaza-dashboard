"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseAuditRepository } from "../api/supabase-audit-repository";
import { queryKeys } from "@/lib/query-keys";
import type { AuditFilters } from "../types";

/** Unified audit feed across imports, corrections, and review actions — DASHBOARD_PLAN.md § 6.6. */
export function useAuditFeed(filters: AuditFilters) {
  return useQuery({
    queryKey: queryKeys.audit.feed(filters as Record<string, unknown>),
    queryFn: async () => {
      const repo = createSupabaseAuditRepository(createClient());
      const result = await repo.listFeed(filters);
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
}
