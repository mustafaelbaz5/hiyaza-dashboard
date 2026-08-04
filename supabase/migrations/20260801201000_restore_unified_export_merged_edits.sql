-- Reverts a regression introduced by 20260801200900_fix_unified_export_usage_type.sql: that
-- migration rewrote unified_holdings_export to select raw holdings/added_holdings base-table
-- columns plus an untouched latest_edit_payload JSON blob, instead of the merged-edits views.
-- Nothing downstream reads latest_edit_payload, so every Flutter-originated edit became
-- invisible in the export (crop type, notes, usage type, etc. always showed the original
-- import value, never the edited one).
--
-- This restores the original 20260801200700 approach — union of holdings_with_merged_edits and
-- added_holdings_with_merged_edits (both already coalesce edit-payload values over base-table
-- values, including usage_type, so 20260801200900's usage_type fix is preserved without needing
-- its raw-payload approach) — and additionally restores un-promoted added_holdings rows
-- (promoted_holding_id is null), which 20260801200900 silently dropped from the export entirely.

drop view if exists unified_holdings_export;

create view unified_holdings_export as
select
  h.id,
  h.city_id,
  h.holding_id_number,
  h.unified_number,
  h.holder_name,
  h.national_id,
  h.owner_name,
  h.land_number,
  h.page_number,
  h.directorate,
  h.administration,
  h.basin_name,
  h.basin_code,
  h.association_name,
  h.border_east,
  h.border_south,
  h.border_west,
  h.border_north,
  h.feddan,
  h.qirat,
  h.sahm,
  h.total_sqm,
  h.crop_type,
  h.notes,
  h.credit_type,
  h.usage_type,
  h.reform_type,
  h.is_inheritance,
  h.is_delegate,
  h.import_batch_id,
  h.imported_at,
  h.created_at,
  h.updated_at,
  h.person_id,
  h.soil_type,
  h.growth_stages,
  h.holder_name_farmer_card,
  h.owner_name_farmer_card,
  h.is_stale,
  h.dedup_key,
  c.name as city_name,
  c.association_type,
  c.association_subtype,
  c.classification,
  c.short_code
from holdings_with_merged_edits h
left join cities c on c.id = h.city_id

union all

select
  ah.id,
  ah.city_id,
  ah.holding_id_number,
  null::text as unified_number,
  ah.holder_name,
  ah.national_id,
  ah.owner_name,
  ah.land_number,
  ah.page_number,
  ah.directorate,
  ah.administration,
  ah.basin_name,
  ah.basin_code,
  ah.association_name,
  ah.border_east,
  ah.border_south,
  ah.border_west,
  ah.border_north,
  ah.feddan,
  ah.qirat,
  ah.sahm,
  ah.total_sqm,
  ah.crop_type,
  ah.notes,
  ah.credit_type,
  ah.usage_type,
  ah.reform_type,
  ah.is_inheritance,
  ah.is_delegate,
  null::uuid as import_batch_id,
  null::timestamp as imported_at,
  ah.created_at,
  ah.updated_at,
  ah.person_id,
  ah.soil_type,
  ah.growth_stages,
  ah.holder_name_farmer_card,
  ah.owner_name_farmer_card,
  false as is_stale,
  null::text as dedup_key,
  c.name as city_name,
  c.association_type,
  c.association_subtype,
  c.classification,
  c.short_code
from added_holdings_with_merged_edits ah
left join cities c on c.id = ah.city_id
where ah.promoted_holding_id is null;

comment on view unified_holdings_export is
  'Unified export dataset: fully-merged holdings (all edits applied, restored after the
  20260801200900 regression) from holdings_with_merged_edits and added_holdings_with_merged_edits,
  plus cities metadata. Includes un-promoted added_holdings rows. Source for the Excel export
  pipeline. All fields are at their latest values; no raw payloads returned.';
