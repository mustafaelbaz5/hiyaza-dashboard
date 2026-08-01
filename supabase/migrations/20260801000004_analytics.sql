-- Phase 5 analytics: quality_snapshots table (the one dashboard-only table not already on the
-- live schema) + Postgres views/RPCs backing all four boards, per DASHBOARD_PLAN.md § 6.7 —
-- "every metric is a view or RPC, never client-side aggregation." Column names match the real
-- schema (feddan/qirat/sahm, administration/directorate, basin_code default '-1' not empty).

create table quality_snapshots (
  id                  uuid primary key default gen_random_uuid(),
  city_id             uuid not null references cities(id) on delete cascade,
  captured_at         timestamptz not null default now(),
  overall_score       numeric(5, 2) not null,
  field_completeness  jsonb not null,
  issue_counts        jsonb not null
);

create index quality_snapshots_city_id_idx on quality_snapshots (city_id);
create index quality_snapshots_captured_at_idx on quality_snapshots (captured_at desc);

alter table quality_snapshots enable row level security;

create policy quality_snapshots_read on quality_snapshots
  for select using (auth.uid() is not null);
create policy quality_snapshots_insert_staff on quality_snapshots
  for insert with check (current_role_is(array['admin', 'editor']::user_role[]));

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

-- ---------------------------------------------------------------------------
-- Board 2 — per-city drill-down
-- ---------------------------------------------------------------------------

create function city_drilldown(p_city_id uuid) returns table (
  holdings_count bigint,
  total_feddan numeric,
  total_qirat numeric,
  total_sahm numeric,
  total_sqm numeric,
  added_holdings_count bigint,
  last_import_at timestamptz,
  last_edit_at timestamptz
) as $$
  select
    (select count(*) from holdings where city_id = p_city_id and is_stale = false),
    (select coalesce(sum(feddan), 0) from holdings where city_id = p_city_id and is_stale = false),
    (select coalesce(sum(qirat), 0) from holdings where city_id = p_city_id and is_stale = false),
    (select coalesce(sum(sahm), 0) from holdings where city_id = p_city_id and is_stale = false),
    (select coalesce(sum(total_sqm), 0) from holdings where city_id = p_city_id and is_stale = false),
    (select count(*) from added_holdings where city_id = p_city_id),
    (select max(committed_at) from import_batches where city_id = p_city_id and status = 'committed'),
    (select max(he.edited_at) from holding_edits he where he.city_id = p_city_id)
$$ language sql stable;

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

-- ---------------------------------------------------------------------------
-- Board 3 — data quality
-- ---------------------------------------------------------------------------

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
  p.display_name,
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
    (select max(edited_at) from holding_edits where edited_by = p.id)
  ) as last_active_at
from profiles p
where p.role <> 'field' or exists (select 1 from added_holdings a where a.created_by = p.id);

-- ---------------------------------------------------------------------------
-- Manual quality snapshot RPC — writes a point-in-time row so trends over time are real history.
-- ---------------------------------------------------------------------------

create or replace function capture_quality_snapshot(p_city_id uuid) returns quality_snapshots
language plpgsql
security invoker
as $$
declare
  v_completeness city_field_completeness;
  v_issues city_quality_issues;
  v_score numeric(5,2);
  v_snapshot quality_snapshots;
begin
  select * into v_completeness from city_field_completeness where city_id = p_city_id;
  select * into v_issues from city_quality_issues where city_id = p_city_id;

  v_score := coalesce((
    coalesce(v_completeness.national_id_pct, 0) + coalesce(v_completeness.basin_code_pct, 0) +
    coalesce(v_completeness.area_pct, 0) + coalesce(v_completeness.unified_number_pct, 0) +
    coalesce(v_completeness.holder_name_pct, 0)
  ) / 5.0, 0);

  insert into quality_snapshots (city_id, overall_score, field_completeness, issue_counts)
  values (
    p_city_id,
    v_score,
    jsonb_build_object(
      'national_id_pct', coalesce(v_completeness.national_id_pct, 0),
      'basin_code_pct', coalesce(v_completeness.basin_code_pct, 0),
      'area_pct', coalesce(v_completeness.area_pct, 0),
      'unified_number_pct', coalesce(v_completeness.unified_number_pct, 0),
      'holder_name_pct', coalesce(v_completeness.holder_name_pct, 0)
    ),
    jsonb_build_object(
      'missing_or_invalid_national_id', coalesce(v_issues.missing_or_invalid_national_id, 0),
      'placeholder_borders', coalesce(v_issues.placeholder_borders, 0),
      'zero_area', coalesce(v_issues.zero_area, 0),
      'missing_basin_code', coalesce(v_issues.missing_basin_code, 0),
      'duplicate_unified_number', coalesce(v_issues.duplicate_unified_number, 0)
    )
  )
  returning * into v_snapshot;

  return v_snapshot;
end;
$$;

comment on function capture_quality_snapshot is
  'Writes a point-in-time quality_snapshots row for a city so quality trends are real history, not just a live number.';
