-- Analytics as Postgres views/RPCs — DASHBOARD_PLAN.md § 6.7: "every metric is a view or RPC,
-- never client-side aggregation." Plain views for v1; promote to materialized only if measured
-- slow (per the plan's explicit guidance not to pre-optimize).

-- ---------------------------------------------------------------------------
-- Board 1 — system overview (all cities)
-- ---------------------------------------------------------------------------

create view system_overview as
select
  (select count(*) from cities) as total_cities,
  (select count(*) from cities where status = 'draft') as draft_cities,
  (select count(*) from cities where status = 'published') as published_cities,
  (select count(*) from cities where status = 'archived') as archived_cities,
  (select count(*) from holdings where is_stale = false) as total_holdings,
  (select count(distinct national_id) from holdings where is_stale = false and national_id is not null) as total_distinct_people,
  (select coalesce(sum(area_feddan), 0) from holdings where is_stale = false) as total_area_feddan,
  (select coalesce(sum(area_qirat), 0) from holdings where is_stale = false) as total_area_qirat,
  (select coalesce(sum(area_sahm), 0) from holdings where is_stale = false) as total_area_sahm,
  (select coalesce(sum(area_sqm), 0) from holdings where is_stale = false) as total_area_sqm,
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
  (select count(*) from added_holdings where status = 'pending') as pending_reviews;

-- ---------------------------------------------------------------------------
-- Board 2 — per-city drill-down
-- ---------------------------------------------------------------------------

create function city_drilldown(p_city_id uuid) returns table (
  holdings_count bigint,
  total_area_feddan numeric,
  total_area_qirat numeric,
  total_area_sahm numeric,
  total_area_sqm numeric,
  added_holdings_count bigint,
  last_import_at timestamptz,
  last_edit_at timestamptz
) as $$
  select
    (select count(*) from holdings where city_id = p_city_id and is_stale = false),
    (select coalesce(sum(area_feddan), 0) from holdings where city_id = p_city_id and is_stale = false),
    (select coalesce(sum(area_qirat), 0) from holdings where city_id = p_city_id and is_stale = false),
    (select coalesce(sum(area_sahm), 0) from holdings where city_id = p_city_id and is_stale = false),
    (select coalesce(sum(area_sqm), 0) from holdings where city_id = p_city_id and is_stale = false),
    (select count(*) from added_holdings where city_id = p_city_id),
    (select max(committed_at) from import_batches where city_id = p_city_id and status = 'committed'),
    (select max(he.created_at) from holding_edits he join holdings h on h.id = he.holding_id where h.city_id = p_city_id)
$$ language sql stable;

create view city_basin_breakdown as
select
  city_id,
  coalesce(basin_name, 'غير محدد') as basin_name,
  count(*) as holdings_count,
  coalesce(sum(area_feddan), 0) as total_area_feddan,
  coalesce(sum(area_sqm), 0) as total_area_sqm
from holdings
where is_stale = false
group by city_id, basin_name;

create view city_top_holders as
select
  city_id,
  holder_name,
  national_id,
  count(*) as holdings_count,
  coalesce(sum(area_feddan), 0) as total_area_feddan
from holdings
where is_stale = false and holder_name is not null
group by city_id, holder_name, national_id;

-- ---------------------------------------------------------------------------
-- Board 3 — data quality (completeness matrix + rule-based issue counts)
-- ---------------------------------------------------------------------------

create view city_field_completeness as
select
  city_id,
  count(*) as total_rows,
  round(count(national_id) filter (where national_id is not null and national_id <> '') * 100.0 / greatest(count(*), 1), 2) as national_id_pct,
  round(count(basin_code) filter (where basin_code is not null and basin_code <> '') * 100.0 / greatest(count(*), 1), 2) as basin_code_pct,
  round(count(*) filter (where coalesce(area_feddan, 0) + coalesce(area_qirat, 0) + coalesce(area_sahm, 0) > 0) * 100.0 / greatest(count(*), 1), 2) as area_pct,
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
    where border_east in ('0', '') and border_west in ('0', '')
      and border_south in ('0', '') and border_north in ('0', '')
  ) as placeholder_borders,
  count(*) filter (
    where coalesce(area_feddan, 0) = 0 and coalesce(area_qirat, 0) = 0 and coalesce(area_sahm, 0) = 0
  ) as zero_area,
  count(*) filter (
    where basin_code is null or basin_code = ''
  ) as missing_basin_code,
  count(*) - count(distinct nullif(unified_number, '')) as duplicate_unified_number
from holdings
where is_stale = false
group by city_id;

-- ---------------------------------------------------------------------------
-- Board 4 — team activity
-- ---------------------------------------------------------------------------

create view team_activity as
select
  p.id as user_id,
  p.full_name,
  p.email,
  p.role,
  (select count(*) from added_holdings where created_by = p.id) as records_added,
  (select count(*) from holding_edits where edited_by = p.id) as edits_made,
  (select count(distinct city_id) from added_holdings where created_by = p.id) as cities_touched,
  (
    select round(
      count(*) filter (where status = 'approved') * 100.0 / greatest(count(*), 1), 2
    )
    from added_holdings where created_by = p.id
  ) as approval_rate,
  greatest(
    (select max(created_at) from added_holdings where created_by = p.id),
    (select max(created_at) from holding_edits where edited_by = p.id)
  ) as last_active_at
from profiles p
where p.role <> 'field' or exists (select 1 from added_holdings a where a.created_by = p.id);
