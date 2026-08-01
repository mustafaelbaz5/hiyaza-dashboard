-- Real duplicate-detection gap: holdings_unified_unique only covers rows where unified_number
-- is not null. Rows without one (present in the real source data — the sample file has ~21)
-- had no duplicate protection at all: re-uploading the same file would insert them again every
-- time. Adds a generated `dedup_key` column that is the business identity of a holding —
-- unified_number when present (unchanged primary identity), falling back to
-- holder_name + national_id + land_number + page_number + basin_code + basin_name when it
-- isn't, so two rows only collide when everything a person could use to recognize "this is the
-- same record" actually matches.

alter table holdings drop constraint if exists holdings_unified_unique;
drop index if exists holdings_unified_unique;

alter table holdings add column dedup_key text generated always as (
  case
    when unified_number is not null and unified_number <> '' then 'U:' || unified_number
    else 'F:' || coalesce(holder_name, '') || '|' || coalesce(national_id, '') || '|' ||
         coalesce(land_number, '') || '|' || coalesce(page_number, '') || '|' ||
         coalesce(basin_code, '') || '|' || coalesce(basin_name, '')
  end
) stored;

create unique index holdings_city_dedup_key_unique on holdings (city_id, dedup_key);

comment on column holdings.dedup_key is
  'Business identity of a holding for duplicate detection: unified_number when present, else a composite of the identifying fields a person would use to recognize the same record. Re-uploading the same file must not create duplicates even for rows lacking a unified_number.';
