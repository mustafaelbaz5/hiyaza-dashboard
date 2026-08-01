"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseAnalyticsRepository } from "../api/supabase-analytics-repository";
import { queryKeys } from "@/lib/query-keys";

/** Board 3 — completeness matrix + rule-based issue counts, optionally scoped to one city. */
export function useQualityData(cityId?: string) {
  const completeness = useQuery({
    queryKey: [...queryKeys.analytics.quality(cityId), "completeness"],
    queryFn: async () => {
      const repo = createSupabaseAnalyticsRepository(createClient());
      const result = await repo.getFieldCompleteness(cityId);
      if (!result.ok) throw result.error;
      return result.value;
    },
  });

  const issues = useQuery({
    queryKey: [...queryKeys.analytics.quality(cityId), "issues"],
    queryFn: async () => {
      const repo = createSupabaseAnalyticsRepository(createClient());
      const result = await repo.getQualityIssues(cityId);
      if (!result.ok) throw result.error;
      return result.value;
    },
  });

  return { completeness, issues };
}

/** Manually captures a quality_snapshots row for a city (control feature, § 6.7 point 6). */
export function useCaptureQualitySnapshot(cityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const repo = createSupabaseAnalyticsRepository(createClient());
      const result = await repo.captureQualitySnapshot(cityId);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics", "snapshots", cityId] });
    },
  });
}

/** Historical quality snapshots for a city — trend data, not just a live number. */
export function useQualitySnapshotHistory(cityId: string) {
  return useQuery({
    queryKey: ["analytics", "snapshots", cityId],
    queryFn: async () => {
      const repo = createSupabaseAnalyticsRepository(createClient());
      const result = await repo.getQualitySnapshotHistory(cityId);
      if (!result.ok) throw result.error;
      return result.value;
    },
    enabled: Boolean(cityId),
  });
}
