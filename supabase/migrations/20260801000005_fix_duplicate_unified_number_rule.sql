-- Fixes a real bug found verifying the quality board against actual imported data: the original
-- duplicate_unified_number rule (count(*) - count(distinct nullif(unified_number, ''))) counts
-- every row with a NULL unified_number as if it were a duplicate, because SQL's count(distinct)
-- excludes nulls from the distinct count. On the real sample data (911 holdings post-dedup
-- upsert, 21 of them with no unified_number) this reported "21 duplicates" that were actually
-- just missing values — already surfaced correctly by unified_number_pct in the completeness
-- view. Post-import there should never be a true duplicate anyway (the partial unique index on
-- (city_id, unified_number) where unified_number is not null enforces it) — this rule is only
-- meaningful as a pre-import warning, which the import preview step already provides.

create or replace view city_quality_issues as
select
  city_id,
  count(*) filter (
    where national_id is null or national_id = '' or national_id !~ '^\d{14}$'
  ) as missing_or_invalid_national_id,
  count(*) filter (
    where coalesce(border_east, '0') = '0' and coalesce(border_west, '0') = '0'
      and coalesce(border_south, '0') = '0' and coalesce(border_north, '0') = '0'
  ) as placeholder_borders,
  count(*) filter (where feddan = 0 and qirat = 0 and sahm = 0) as zero_area,
  count(*) filter (where basin_code is null or basin_code = '-1') as missing_basin_code,
  count(*) filter (where unified_number is not null)
    - count(distinct unified_number) filter (where unified_number is not null) as duplicate_unified_number
from holdings
where is_stale = false
group by city_id;
