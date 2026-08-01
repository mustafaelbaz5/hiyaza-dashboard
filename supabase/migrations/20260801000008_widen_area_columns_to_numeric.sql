-- Widens feddan/qirat/sahm from `int` to `numeric` on holdings and added_holdings so fractional
-- values (confirmed present in the real source data, e.g. سهم = 10.75) can be stored exactly
-- instead of being rejected or rounded — rounding would silently change a legal land-share
-- value, which is unacceptable for this data. numeric(10,4) matches the precision already used
-- for total_sqm. Existing integer values are numerically unaffected by the widen.
--
-- Five Phase 5 analytics views reference these columns and must be dropped before the column
-- type can change (Postgres tracks view -> column dependencies), then recreated identically
-- afterward — city_quality_issues uses its corrected definition from migration 000005, not the
-- original one from 000004.

drop view if exists system_overview;
drop view if exists city_basin_breakdown;
drop view if exists city_top_holders;
drop view if exists city_field_completeness;
drop view if exists city_quality_issues;

alter table holdings
  alter column feddan type numeric(10, 4) using feddan::numeric(10, 4),
  alter column qirat type numeric(10, 4) using qirat::numeric(10, 4),
  alter column sahm type numeric(10, 4) using sahm::numeric(10, 4);

alter table added_holdings
  alter column feddan type numeric(10, 4) using feddan::numeric(10, 4),
  alter column qirat type numeric(10, 4) using qirat::numeric(10, 4),
  alter column sahm type numeric(10, 4) using sahm::numeric(10, 4);

create view system_overview as
select
  (select count(*) from cities) as total_cities,
  (select count(*) from cities where status = 'draft') as draft_cities,
  (select count(*) from cities where status = 'published') as published_cities,
  (select count(*) from cities where status = 'archived') as archived_cities,
  (select count(*) from holdings where is_stale = false) as total_holdings,
  (select count(distinct national_id) from holdings where is_stale = false and national_id is not null) as total_distinct_people,
  (select coalesce(sum(feddan), 0) from holdings where is_stale = false) as total_feddan,
  (select coalesce(sum(qirat), 0) from holdings where is_stale = false) as total_qirat,
  (select coalesce(sum(sahm), 0) from holdings where is_stale = false) as total_sahm,
  (select coalesce(sum(total_sqm), 0) from holdings where is_stale = false) as total_sqm,
  (
    select count(*) from cities c
    where not exists (select 1 from import_batches b where b.city_id = c.id and b.status = 'committed')
  ) as cities_never_imported,
  (
    select count(*) from cities c
    where exists (
      select 1 from import_batches b
      where b.city_id = c.id and b.status = 'committed'
      group by b.city_id
      having max(b.committed_at) < now() - interval '90 days'
    )
  ) as cities_stale_90d,
  (select count(*) from added_holdings where status = 'pending') as pending_reviews,
  (
    select count(distinct edited_by) from holding_edits where edited_at > now() - interval '7 days'
  ) + (
    select count(distinct created_by) from added_holdings where created_at > now() - interval '7 days'
  ) as active_users_7d,
  (
    select count(distinct edited_by) from holding_edits where edited_at > now() - interval '30 days'
  ) + (
    select count(distinct created_by) from added_holdings where created_at > now() - interval '30 days'
  ) as active_users_30d;

create view city_basin_breakdown as
select
  city_id,
  coalesce(basin_name, 'غير محدد') as basin_name,
  count(*) as holdings_count,
  coalesce(sum(feddan), 0) as total_feddan,
  coalesce(sum(total_sqm), 0) as total_sqm
from holdings
where is_stale = false
group by city_id, basin_name;

create view city_top_holders as
select
  city_id,
  holder_name,
  national_id,
  count(*) as holdings_count,
  coalesce(sum(feddan), 0) as total_feddan
from holdings
where is_stale = false and holder_name is not null
group by city_id, holder_name, national_id;

create view city_field_completeness as
select
  city_id,
  count(*) as total_rows,
  round(count(national_id) filter (where national_id is not null and national_id <> '') * 100.0 / greatest(count(*), 1), 2) as national_id_pct,
  round(count(*) filter (where basin_code is not null and basin_code <> '-1') * 100.0 / greatest(count(*), 1), 2) as basin_code_pct,
  round(count(*) filter (where feddan > 0 or qirat > 0 or sahm > 0) * 100.0 / greatest(count(*), 1), 2) as area_pct,
  round(count(unified_number) filter (where unified_number is not null and unified_number <> '') * 100.0 / greatest(count(*), 1), 2) as unified_number_pct,
  round(count(*) filter (where holder_name is not null and holder_name <> '') * 100.0 / greatest(count(*), 1), 2) as holder_name_pct
from holdings
where is_stale = false
group by city_id;

create view city_quality_issues as
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
