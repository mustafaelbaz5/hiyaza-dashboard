/**
 * Mirrors the `holdings.dedup_key` generated column exactly (see
 * supabase/migrations/20260801000009_composite_dedup_key.sql) — the business identity of a
 * holding: unified_number when present, otherwise a composite of the fields a person would use
 * to recognize "this is the same record". Used client-side only to *estimate* the new/changed
 * diff shown in the import preview; the database's generated column is the actual source of
 * truth for what counts as a duplicate at commit time.
 */
export function computeDedupKey(row: {
  unifiedNumber: string | null;
  holderName: string | null;
  nationalId: string | null;
  landNumber: string | null;
  pageNumber: string | null;
  basinCode: string | null;
  basinName: string | null;
}): string {
  if (row.unifiedNumber) {
    return `U:${row.unifiedNumber}`;
  }
  return [
    "F:",
    row.holderName ?? "",
    row.nationalId ?? "",
    row.landNumber ?? "",
    row.pageNumber ?? "",
    row.basinCode ?? "",
    row.basinName ?? "",
  ].join("|");
}
