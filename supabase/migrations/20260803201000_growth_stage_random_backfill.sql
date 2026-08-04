-- One-time backfill: assign a random growth stage to every holdings/added_holdings row that
-- already has a real crop_type value, per the 3-option domain the field team uses today. Applies
-- once; does not touch rows with a null/empty crop_type (per explicit product decision — this
-- column stays blank until Flutter starts sending crop_type data). growth_stages is null guard
-- avoids overwriting any value a human may have already entered manually. Safe to re-run later
-- once crop_type data exists — it only ever touches rows where growth_stages is still null.

update holdings
set growth_stages = (
  array['مرحله الانبات', 'مرحله النمو الخضري', 'مرحله الإزهار واثمار']
)[floor(random() * 3 + 1)]
where crop_type is not null and crop_type <> '' and growth_stages is null;

update added_holdings
set growth_stages = (
  array['مرحله الانبات', 'مرحله النمو الخضري', 'مرحله الإزهار واثمار']
)[floor(random() * 3 + 1)]
where crop_type is not null and crop_type <> '' and growth_stages is null;
