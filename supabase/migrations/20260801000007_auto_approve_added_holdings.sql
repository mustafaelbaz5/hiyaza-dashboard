-- Changes the review workflow from gatekeeping to visibility-only, per the user's explicit
-- request: field-added records should promote into `holdings` immediately, no manual approval
-- wait, while the audit trail keeps full attribution (who added it, when). This is exactly the
-- posture DASHBOARD_PLAN.md § 6.5 already anticipated: "review is about visibility and
-- correction, not gatekeeping — the app shows the record either way." Auto-approval just skips
-- the intermediate manual click.
--
-- A field user's role has no write access to `holdings` (holdings_write requires admin/editor,
-- APP_PLAN.md § 6.1) — SECURITY DEFINER is what lets this trigger promote on their behalf
-- without granting field users broad holdings write access generally.

create or replace function auto_approve_added_holding() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_holding_id_number text;
  v_new_holding holdings;
begin
  -- "Add parcel for existing person" copies their official number (APP_PLAN.md § 6.2 decision
  -- #8) rather than leaving it null, which is reserved for a genuinely new person.
  if new.parent_holding_id is not null then
    select holding_id_number into v_holding_id_number
    from holdings where id = new.parent_holding_id;
  else
    v_holding_id_number := new.holding_id_number;
  end if;

  insert into holdings (
    city_id, holding_id_number, unified_number, holder_name, national_id, land_number,
    page_number, basin_name, basin_code, association_name, administration, directorate,
    border_east, border_west, border_south, border_north, feddan, qirat, sahm, total_sqm,
    is_stale
  ) values (
    new.city_id, v_holding_id_number, new.unified_number, new.holder_name, new.national_id,
    new.land_number, new.page_number, new.basin_name, new.basin_code, new.association_name,
    new.administration, new.directorate, new.border_east, new.border_west, new.border_south,
    new.border_north, new.feddan, new.qirat, new.sahm, new.total_sqm, false
  )
  returning * into v_new_holding;

  update added_holdings
  set status = 'approved',
      promoted_holding_id = v_new_holding.id,
      reviewed_by = new.created_by,
      reviewed_at = now()
  where id = new.id;

  return new;
end;
$$;

comment on function auto_approve_added_holding is
  'Auto-promotes every field-added record into holdings on insert — review is history/attribution only, not a gate. reviewed_by is set to the creator since no separate reviewer acts.';

create trigger added_holdings_auto_approve
  after insert on added_holdings
  for each row execute function auto_approve_added_holding();
