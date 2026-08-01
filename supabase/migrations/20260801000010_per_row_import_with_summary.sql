-- Rewrites commit_import_batch from one set-based INSERT...SELECT (where a single malformed
-- row aborted the entire batch) into a per-row loop with isolated error handling, so one bad
-- row is recorded and skipped rather than rolling back every other row in the file. Returns a
-- full import summary (imported/duplicate/failed counts + per-failure reasons) instead of just
-- the import_batches row, matching the requirement that an import never silently drops data and
-- always reports exactly what happened to every row.
--
-- Duplicate detection now targets the new (city_id, dedup_key) unique index instead of
-- (city_id, unified_number) — see 20260801000009. A row that matches an existing dedup_key is
-- an upsert (counted as "duplicate" in the summary, its data still refreshed in place); a row
-- that inserts cleanly is counted as "imported". Either way, re-uploading the same file can
-- never create a second holdings row for the same business identity.

drop function if exists commit_import_batch(uuid, text, text, int, int, int, jsonb, jsonb, jsonb);

create or replace function commit_import_batch(
  p_city_id uuid,
  p_file_name text,
  p_storage_path text,
  p_rows_total int,
  p_rows_skipped_blank int,
  p_mapping_used jsonb,
  p_records jsonb -- array of holdings insert records, snake_case keys matching the holdings table, each carrying source_row_number
) returns jsonb
language plpgsql
security invoker
as $$
declare
  v_batch import_batches;
  v_record jsonb;
  v_is_new boolean;
  v_imported int := 0;
  v_duplicates int := 0;
  v_failed int := 0;
  v_failures jsonb := '[]'::jsonb;
begin
  insert into import_batches (
    city_id, file_name, storage_path, status, rows_total, rows_imported, rows_rejected,
    rejection_log, mapping_used, imported_by, committed_at
  ) values (
    p_city_id, p_file_name, p_storage_path, 'committed', p_rows_total, 0, p_rows_skipped_blank,
    jsonb_build_array(), p_mapping_used, auth.uid(), now()
  )
  returning * into v_batch;

  for v_record in select * from jsonb_array_elements(p_records)
  loop
    begin
      insert into holdings (
        city_id, import_batch_id, holding_id_number, unified_number, holder_name, national_id,
        land_number, page_number, basin_name, basin_code, association_name, administration,
        directorate, border_east, border_west, border_south, border_north, feddan, qirat, sahm,
        total_sqm, is_stale
      ) values (
        (v_record ->> 'city_id')::uuid,
        v_batch.id,
        v_record ->> 'holding_id_number',
        v_record ->> 'unified_number',
        v_record ->> 'holder_name',
        v_record ->> 'national_id',
        v_record ->> 'land_number',
        v_record ->> 'page_number',
        v_record ->> 'basin_name',
        v_record ->> 'basin_code',
        v_record ->> 'association_name',
        v_record ->> 'administration',
        v_record ->> 'directorate',
        v_record ->> 'border_east',
        v_record ->> 'border_west',
        v_record ->> 'border_south',
        v_record ->> 'border_north',
        nullif(v_record ->> 'feddan', '')::numeric,
        nullif(v_record ->> 'qirat', '')::numeric,
        nullif(v_record ->> 'sahm', '')::numeric,
        nullif(v_record ->> 'total_sqm', '')::numeric,
        false
      )
      on conflict (city_id, dedup_key) do update set
        import_batch_id = excluded.import_batch_id,
        holding_id_number = excluded.holding_id_number,
        unified_number = excluded.unified_number,
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
        imported_at = now()
      returning (xmax = 0) into v_is_new;

      if v_is_new then
        v_imported := v_imported + 1;
      else
        v_duplicates := v_duplicates + 1;
      end if;

    exception when others then
      v_failed := v_failed + 1;
      v_failures := v_failures || jsonb_build_object(
        'row', (v_record ->> 'source_row_number')::int,
        'holderName', v_record ->> 'holder_name',
        'reason', sqlerrm
      );
    end;
  end loop;

  -- Every holding this run actually touched (inserted or updated) now carries this batch's id.
  -- Anything in the city that wasn't touched is absent from the new file — mark stale, never
  -- delete, since a field user may have edits attached to it.
  update holdings
  set is_stale = true
  where city_id = p_city_id
    and import_batch_id is distinct from v_batch.id
    and is_stale = false;

  update import_batches
  set rows_imported = v_imported,
      rows_rejected = p_rows_skipped_blank + v_failed,
      rejection_log = v_failures
  where id = v_batch.id;

  return jsonb_build_object(
    'batchId', v_batch.id,
    'rowsTotal', p_rows_total,
    'rowsImported', v_imported,
    'rowsDuplicate', v_duplicates,
    'rowsFailed', v_failed,
    'rowsSkippedBlank', p_rows_skipped_blank,
    'failures', v_failures
  );
end;
$$;

comment on function commit_import_batch is
  'Imports every row individually with isolated error handling — one bad row is recorded as a failure and skipped, never aborts the rest of the file. Duplicate rows (matching an existing business identity) are upserted in place, never duplicated. Returns a full per-row summary.';
