-- Fixes a real bug found while testing against the actual sample workbook: the real
-- الدير_ائتمان_مجمع.xlsx has 306 rows sharing a duplicate الرقم الموحد للحيازة (unified_number)
-- within the same city. `ON CONFLICT ... DO UPDATE` cannot affect the same row twice within one
-- INSERT statement ("ON CONFLICT DO UPDATE command cannot affect row a second time" — Postgres
-- error 21000). Deduplicates the incoming batch by unified_number before upserting, keeping the
-- last occurrence in file order (mirrors "later rows win" on a re-import).

create or replace function commit_import_batch(
  p_city_id uuid,
  p_file_name text,
  p_storage_path text,
  p_rows_total int,
  p_rows_imported int,
  p_rows_rejected int,
  p_rejection_log jsonb,
  p_mapping_used jsonb,
  p_records jsonb
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
  from (
    select r
    from (
      select r, ord, row_number() over (partition by r ->> 'unified_number' order by ord desc) as rn
      from jsonb_array_elements(p_records) with ordinality as t(r, ord)
    ) numbered
    where r ->> 'unified_number' is null or rn = 1
  ) deduped
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
  'Atomically writes an import_batches row + upserts holdings rows on (city_id, unified_number), deduplicating within-batch collisions (keeps last occurrence). Runs with the caller''s own RLS (security invoker).';
