"use client";

import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { createSupabaseHoldingsRepository } from "../api/supabase-holdings-repository";
import { buildHoldingsCsv } from "../core/export-csv";
import type { HoldingsListFilters } from "../types";

function downloadCsv(csv: string, fileName: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

/** Exports the current filtered view (not just the visible page) to a downloaded CSV. */
export function useExportHoldings(cityId: string) {
  return useMutation({
    mutationFn: async (filters: HoldingsListFilters | undefined) => {
      const repo = createSupabaseHoldingsRepository(createClient());
      const result = await repo.listAllForExport(cityId, filters);
      if (!result.ok) throw result.error;
      return result.value;
    },
    onSuccess: (rows) => {
      downloadCsv(buildHoldingsCsv(rows), `holdings-${cityId}.csv`);
    },
  });
}
