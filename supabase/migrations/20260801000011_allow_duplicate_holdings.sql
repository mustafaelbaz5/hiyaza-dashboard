-- Removes the deduplication constraint that was preventing duplicate rows from being imported.
-- Now all rows from an Excel file will be imported, even if they have identical values.
-- The dedup_key column is kept for future use (e.g., analytics, user-initiated deduplication),
-- but no longer enforced as a unique constraint.

-- Drop the unique index on (city_id, dedup_key)
drop index if exists holdings_city_dedup_key_unique;

-- Rewrite commit_import_batch to insert all rows without ON CONFLICT
drop function if exists commit_import_batch(uuid, text, text, int, int, jsonb, jsonb);

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
  v_imported int := 0;
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
      );

      v_imported := v_imported + 1;

    exception when others then
      v_failed := v_failed + 1;
      v_failures := v_failures || jsonb_build_object(
        'row', (v_record ->> 'source_row_number')::int,
        'holderName', v_record ->> 'holder_name',
        'reason', sqlerrm
      );
    end;
  end loop;

  -- Every holding this run actually touched (inserted) now carries this batch's id.
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
    'rowsDuplicate', 0,
    'rowsFailed', v_failed,
    'rowsSkippedBlank', p_rows_skipped_blank,
    'failures', v_failures
  );
end;
$$;

comment on function commit_import_batch is
  'Imports every row individually without deduplication — all rows from the file are imported, even if they have identical values. Per-row error handling ensures one bad row is recorded as a failure and skipped, never aborts the rest of the file. Returns a full per-row summary.';
