-- Additive migration: one RPC so the dashboard's Excel import commits atomically.
-- Supabase-js has no multi-statement client transaction; a plpgsql function body is
-- transactional by default, which is what DASHBOARD_PLAN.md § 6.3 requires ("one transaction
-- writing an import_batches row plus the holdings rows, so a failed import leaves nothing
-- behind"). Does not alter any existing table.

create or replace function commit_import_batch(
  p_city_id uuid,
  p_file_name text,
  p_storage_path text,
  p_rows_total int,
  p_rows_imported int,
  p_rows_rejected int,
  p_rejection_log jsonb,
  p_mapping_used jsonb,
  p_records jsonb -- array of holdings insert records, snake_case keys matching the holdings table
) returns import_batches
language plpgsql
security invoker
as $$
declare
  v_batch import_batches;
begin
  insert into import_batches (
    city_id, file_name, storage_path, status, rows_total, rows_imported, rows_rejected,
    rejection_log, mapping_used, imported_by, committed_at
  ) values (
    p_city_id, p_file_name, p_storage_path, 'committed', p_rows_total, p_rows_imported,
    p_rows_rejected, p_rejection_log, p_mapping_used, auth.uid(), now()
  )
  returning * into v_batch;

  -- Existing rows absent from this import are marked stale, never deleted — a field user may
  -- have edits attached to them (DASHBOARD_PLAN.md § 6.3 re-import behavior).
  update holdings
  set is_stale = true
  where city_id = p_city_id
    and unified_number is not null
    and unified_number not in (
      select value ->> 'unified_number' from jsonb_array_elements(p_records)
    );

  insert into holdings (
    city_id, import_batch_id, holding_id_number, unified_number, holder_name, national_id,
    land_number, page_number, basin_name, basin_code, association_name, administration,
    directorate, border_east, border_west, border_south, border_north, feddan, qirat, sahm,
    total_sqm, is_stale
  )
  select
    (r ->> 'city_id')::uuid,
    v_batch.id,
    r ->> 'holding_id_number',
    r ->> 'unified_number',
    r ->> 'holder_name',
    r ->> 'national_id',
    r ->> 'land_number',
    r ->> 'page_number',
    r ->> 'basin_name',
    r ->> 'basin_code',
    r ->> 'association_name',
    r ->> 'administration',
    r ->> 'directorate',
    r ->> 'border_east',
    r ->> 'border_west',
    r ->> 'border_south',
    r ->> 'border_north',
    (r ->> 'feddan')::int,
    (r ->> 'qirat')::int,
    (r ->> 'sahm')::int,
    nullif(r ->> 'total_sqm', '')::numeric,
    false
  from jsonb_array_elements(p_records) as r
  on conflict (city_id, unified_number) where unified_number is not null
  do update set
    import_batch_id = excluded.import_batch_id,
    holding_id_number = excluded.holding_id_number,
    holder_name = excluded.holder_name,
    national_id = excluded.national_id,
    land_number = excluded.land_number,
    page_number = excluded.page_number,
    basin_name = excluded.basin_name,
    basin_code = excluded.basin_code,
    association_name = excluded.association_name,
    administration = excluded.administration,
    directorate = excluded.directorate,
    border_east = excluded.border_east,
    border_west = excluded.border_west,
    border_south = excluded.border_south,
    border_north = excluded.border_north,
    feddan = excluded.feddan,
    qirat = excluded.qirat,
    sahm = excluded.sahm,
    total_sqm = excluded.total_sqm,
    is_stale = false,
    imported_at = now();

  return v_batch;
end;
$$;

comment on function commit_import_batch is
  'Atomically writes an import_batches row + upserts holdings rows on (city_id, unified_number). Runs with the caller''s own RLS (security invoker), so only editor/admin can actually commit.';

-- Rollback: revert a city to its previous batch by deleting this batch's holdings and
-- un-staling the previous batch's rows (DASHBOARD_PLAN.md § 6.3).
create or replace function rollback_import_batch(p_batch_id uuid) returns void
language plpgsql
security invoker
as $$
declare
  v_city_id uuid;
begin
  select city_id into v_city_id from import_batches where id = p_batch_id;
  if v_city_id is null then
    raise exception 'import batch not found';
  end if;

  delete from holdings where import_batch_id = p_batch_id;

  update holdings h
  set is_stale = false
  where h.city_id = v_city_id
    and h.import_batch_id = (
      select ib.id from import_batches ib
      where ib.city_id = v_city_id and ib.status = 'committed' and ib.id <> p_batch_id
      order by ib.committed_at desc
      limit 1
    );

  update import_batches set status = 'rolled_back' where id = p_batch_id;
end;
$$;

comment on function rollback_import_batch is
  'Deletes a batch''s holdings rows and un-stales the previous batch''s rows. Runs with caller''s own RLS.';
