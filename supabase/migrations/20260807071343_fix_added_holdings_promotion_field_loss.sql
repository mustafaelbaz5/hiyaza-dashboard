-- RECONCILIATION NOTE (added 2026-08-07): this migration was found already applied live on
-- production (bbahuyqjptojlighriyy) with no corresponding file in this repository — a
-- repo/database drift discovered during unrelated dedup work. Its origin could not be determined
-- from available Supabase logs/advisors (no actor attribution retained for DDL on this project).
-- This file was reconstructed verbatim from the live `schema_migrations.statements` content to
-- close the drift, NOT reapplied — the live database already has this exact function body.
--
-- Content assessment: purely additive bug fix. Both approve_added_holding (manual review RPC)
-- and auto_approve_added_holding (the auto-promotion trigger) were previously dropping
-- person_id, owner_name, crop_type, notes, credit_type, reform_type, usage_type, is_inheritance,
-- is_delegate, holder_name_farmer_card, owner_name_farmer_card, and growth_stages when an
-- added_holdings row was promoted into holdings — none of those columns were in the original
-- INSERT column list (see the pre-drift versions in 20260801000003_review_and_audit.sql and
-- 20260801000007_auto_approve_added_holdings.sql). This migration adds them to both functions'
-- INSERT lists so promotion no longer silently loses that data. No conflict found with any
-- migration applied before or after it in this session.

create or replace function public.approve_added_holding(
  p_added_holding_id uuid,
  p_holding_id_number text
)
returns holdings
language plpgsql
as $function$
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
    is_stale, person_id, owner_name, crop_type, notes, credit_type, reform_type, usage_type,
    is_inheritance, is_delegate, holder_name_farmer_card, owner_name_farmer_card, growth_stages
  ) values (
    v_added.city_id, p_holding_id_number, v_added.unified_number, v_added.holder_name,
    v_added.national_id, v_added.land_number, v_added.page_number, v_added.basin_name,
    v_added.basin_code, v_added.association_name, v_added.administration, v_added.directorate,
    v_added.border_east, v_added.border_west, v_added.border_south, v_added.border_north,
    v_added.feddan, v_added.qirat, v_added.sahm, v_added.total_sqm, false, v_added.person_id,
    v_added.owner_name, v_added.crop_type, v_added.notes, v_added.credit_type,
    v_added.reform_type, v_added.usage_type, v_added.is_inheritance, v_added.is_delegate,
    v_added.holder_name_farmer_card, v_added.owner_name_farmer_card, v_added.growth_stages
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
$function$;

create or replace function public.auto_approve_added_holding()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_holding_id_number text;
  v_new_holding holdings;
begin
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
    is_stale, person_id, owner_name, crop_type, notes, credit_type, reform_type, usage_type,
    is_inheritance, is_delegate, holder_name_farmer_card, owner_name_farmer_card, growth_stages
  ) values (
    new.city_id, v_holding_id_number, new.unified_number, new.holder_name, new.national_id,
    new.land_number, new.page_number, new.basin_name, new.basin_code, new.association_name,
    new.administration, new.directorate, new.border_east, new.border_west, new.border_south,
    new.border_north, new.feddan, new.qirat, new.sahm, new.total_sqm, false, new.person_id,
    new.owner_name, new.crop_type, new.notes, new.credit_type, new.reform_type, new.usage_type,
    new.is_inheritance, new.is_delegate, new.holder_name_farmer_card, new.owner_name_farmer_card,
    new.growth_stages
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
$function$;
