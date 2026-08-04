-- The original growth-stage backfill (20260803201000) checked `crop_type is not null` against
-- the raw `holdings`/`added_holdings` base columns. But crop_type is only ever populated via
-- holding_edits (never written back to the base table) — and that backfill ran BEFORE
-- 20260804210000 fixed the camelCase key-extraction bug in holdings_with_merged_edits, so at the
-- time it ran, even the merged view's crop_type was still empty everywhere. Net effect: the
-- original backfill was a no-op for every row, confirmed live (0 eligible rows at the time).
--
-- Now that the camelCase fix is live, holdings_with_merged_edits/added_holdings_with_merged_edits
-- correctly report crop_type for 1,372 + 4 rows respectively. This migration re-runs the same
-- random-assignment logic, but checks eligibility against the MERGED view (edit-overlay applied)
-- instead of the raw base column, and writes the result into the real growth_stages column on
-- holdings/added_holdings (growth_stages itself is a plain column, not edit-derived, so writing
-- directly to it is correct and is what the export pipeline reads).

update holdings h
set growth_stages = (
  array['مرحله الانبات', 'مرحله النمو الخضري', 'مرحله الإزهار واثمار']
)[floor(random() * 3 + 1)]
from holdings_with_merged_edits m
where m.id = h.id
  and m.crop_type is not null and m.crop_type <> ''
  and h.growth_stages is null;

update added_holdings ah
set growth_stages = (
  array['مرحله الانبات', 'مرحله النمو الخضري', 'مرحله الإزهار واثمار']
)[floor(random() * 3 + 1)]
from added_holdings_with_merged_edits m
where m.id = ah.id
  and m.crop_type is not null and m.crop_type <> ''
  and ah.growth_stages is null;
