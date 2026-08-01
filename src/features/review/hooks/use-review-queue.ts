"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseReviewRepository } from "../api/supabase-review-repository";
import { queryKeys } from "@/lib/query-keys";
import type { ReviewListParams } from "../types";

/** Field-added records pending (or already) reviewed — the review queue table's data source. */
export function useReviewQueue(params: ReviewListParams) {
  return useQuery({
    queryKey: queryKeys.review.queue(params.cityId),
    queryFn: async () => {
      const repo = createSupabaseReviewRepository(createClient());
      const result = await repo.list(params);
      if (!result.ok) throw result.error;
      return result.value;
    },
  });
}
