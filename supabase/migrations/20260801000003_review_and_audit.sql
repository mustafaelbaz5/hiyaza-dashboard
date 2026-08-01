-- Additive migration for Phase 4 (review queue + audit trail). Adds reviewer tracking to
-- added_holdings (the real schema has status/rejection_reason/promoted_holding_id but no record
-- of *who* reviewed or *when* — needed for DASHBOARD_PLAN.md § 6.6's audit trail), an atomic
-- approve/reject RPC pair, and a unified audit_feed view over holding_edits + added_holdings +
-- import_batches so no board does client-side aggregation (§ 6.7's stated principle, applied
-- here to the audit trail too). Touches no existing table's behavior for the mobile app.

alter table added_holdings add column if not exists reviewed_by uuid references profiles(id);
alter table added_holdings add column if not exists reviewed_at timestamptz;

-- ---------------------------------------------------------------------------
-- Approve: promotes an added_holdings row into holdings atomically. p_holding_id_number is the
-- official رقم الحيازة an admin assigns at approval time (APP_PLAN.md § 6.2) — null is valid for
-- a brand-new person with no government number yet.
-- ---------------------------------------------------------------------------

create or replace function approve_added_holding(
  p_added_holding_id uuid,
  p_holding_id_number text
) returns holdings
language plpgsql
security invoker
as $$
declare
  v_added added_holdings;
  v_holding holdings;
begin
  select * into v_added from added_holdings where id = p_added_holding_id;
  if v_added is null then
    raise exception 'added_holdings row not found';
  end if;

  insert into holdings (
    city_id, holding_id_number, unified_number, holder_name, national_id, land_number,
    page_number, basin_name, basin_code, association_name, administration, directorate,
    border_east, border_west, border_south, border_north, feddan, qirat, sahm, total_sqm,
    is_stale
  ) values (
    v_added.city_id, p_holding_id_number, v_added.unified_number, v_added.holder_name,
    v_added.national_id, v_added.land_number, v_added.page_number, v_added.basin_name,
    v_added.basin_code, v_added.association_name, v_added.administration, v_added.directorate,
    v_added.border_east, v_added.border_west, v_added.border_south, v_added.border_north,
    v_added.feddan, v_added.qirat, v_added.sahm, v_added.total_sqm, false
  )
  returning * into v_holding;

  update added_holdings
  set status = 'approved',
      promoted_holding_id = v_holding.id,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      updated_at = now()
  where id = p_added_holding_id;

  return v_holding;
end;
$$;

comment on function approve_added_holding is
  'Promotes a field-added record into holdings and marks it approved, atomically. Runs with caller''s own RLS.';

create or replace function reject_added_holding(
  p_added_holding_id uuid,
  p_reason text
) returns void
language plpgsql
security invoker
as $$
begin
  update added_holdings
  set status = 'rejected',
      rejection_reason = p_reason,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      updated_at = now()
  where id = p_added_holding_id;
end;
$$;

comment on function reject_added_holding is
  'Marks a field-added record rejected with a reason. Runs with caller''s own RLS.';

-- ---------------------------------------------------------------------------
-- Unified audit feed — DASHBOARD_PLAN.md § 6.6: chronological, joined to profiles, filterable.
-- Field-level before/after diffs are computed at the application layer when a row is expanded
-- (holding_edits.payload is a full snapshot, so the diff needs the prior snapshot/base row —
-- not a fixed shape a plain view can express without a self-join per row).
-- ---------------------------------------------------------------------------

create view audit_feed as
select
  'import'::text as entity_type,
  ib.id as entity_id,
  ib.city_id,
  ib.imported_by as user_id,
  ib.created_at as occurred_at,
  jsonb_build_object(
    'file_name', ib.file_name,
    'status', ib.status,
    'rows_imported', ib.rows_imported,
    'rows_rejected', ib.rows_rejected
  ) as details
from import_batches ib

union all

select
  'holding_edit'::text,
  he.id,
  he.city_id,
  he.edited_by,
  he.edited_at,
  jsonb_build_object('holding_id', he.holding_id, 'payload', he.payload)
from holding_edits he

union all

select
  'added_holding'::text,
  ah.id,
  ah.city_id,
  coalesce(ah.reviewed_by, ah.created_by),
  coalesce(ah.reviewed_at, ah.updated_at),
  jsonb_build_object(
    'status', ah.status,
    'holder_name', ah.holder_name,
    'rejection_reason', ah.rejection_reason,
    'promoted_holding_id', ah.promoted_holding_id
  )
from added_holdings ah;

comment on view audit_feed is
  'Unified chronological feed across imports, holding corrections, and field-added-record review — DASHBOARD_PLAN.md § 6.6.';
