"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { TABLES } from "@/lib/constants";

/** Pending-review and failed-import counts for sidebar badges (DASHBOARD_PLAN.md § 6.7 point 7). */
export function useNotificationCounts() {
  return useQuery({
    queryKey: ["notifications", "counts"],
    queryFn: async () => {
      const supabase = createClient();
      const [pendingReviews, failedImports] = await Promise.all([
        supabase.from(TABLES.addedHoldings).select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from(TABLES.importBatches).select("id", { count: "exact", head: true }).eq("status", "failed"),
      ]);

      return {
        pendingReviews: pendingReviews.count ?? 0,
        failedImports: failedImports.count ?? 0,
      };
    },
    refetchInterval: 60_000,
  });
}
