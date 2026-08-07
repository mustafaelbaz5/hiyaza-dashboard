-- Rollback for 20260807040000_import_batches_rows_duplicate.sql. Restores the dedup-guard-only
-- function version (from 20260807000000) that doesn't persist rows_duplicate, then drops the
-- column. Safe at any time.

create or replace function public.commit_import_batch(
  p_city_id uuid,
  p_file_name text,
  p_storage_path text,
  p_rows_total integer,
  p_rows_skipped_blank integer,
  p_mapping_used jsonb,
  p_records jsonb
)
returns jsonb
language plpgsql
set statement_timeout to '120s'
as $function$
declare
  v_batch import_batches;
  v_record jsonb;
  v_imported int := 0;
  v_duplicate int := 0;
  v_failed int := 0;
  v_failures jsonb := '[]'::jsonb;
  v_dedup_key text;
  v_already_exists boolean;
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
      v_dedup_key := case
        when nullif(v_record ->> 'unified_number', '') is not null
          then 'U:' || (v_record ->> 'unified_number')
        else 'F:' ||
          coalesce(v_record ->> 'holder_name', '') || '|' ||
          coalesce(v_record ->> 'national_id', '') || '|' ||
          coalesce(v_record ->> 'land_number', '') || '|' ||
          coalesce(v_record ->> 'page_number', '') || '|' ||
          coalesce(v_record ->> 'basin_code', '') || '|' ||
          coalesce(v_record ->> 'basin_name', '')
      end;

      select exists(
        select 1 from holdings
        where city_id = (v_record ->> 'city_id')::uuid
          and is_stale = false
          and dedup_key = v_dedup_key
      ) into v_already_exists;

      if v_already_exists then
        v_duplicate := v_duplicate + 1;
      else
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

  update import_batches
  set rows_imported = v_imported,
      rows_rejected = p_rows_skipped_blank + v_failed,
      rejection_log = v_failures
  where id = v_batch.id;

  return jsonb_build_object(
    'batchId', v_batch.id,
    'rowsTotal', p_rows_total,
    'rowsImported', v_imported,
    'rowsDuplicate', v_duplicate,
    'rowsFailed', v_failed,
    'rowsSkippedBlank', p_rows_skipped_blank,
    'failures', v_failures
  );
end;
$function$;

alter table import_batches drop column if exists rows_duplicate;
