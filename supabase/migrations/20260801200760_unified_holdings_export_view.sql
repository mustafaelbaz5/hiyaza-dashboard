-- The unified export dataset: provides the fully-merged, latest state of all holdings.
--
-- Sources:
-- - holdings_with_merged_edits: holdings table with all edits merged cumulatively (from Flutter's
--   holding_edits table) — all fields already at their latest values, ready for export
-- - added_holdings_with_merged_edits: same for field-added holdings
-- - cities: joins for association metadata (name, type, classification, short_code)
--
-- Key difference from previous version: All edits are MERGED IN SQL, not raw payloads.
-- Each field reflects ALL edits to that field applied cumulatively, ensuring complete accuracy
-- even when multiple edits touch different fields across multiple actions.
--
-- Example: if holding H001 has 3 edits:
--   Edit 1: {holderName: "Ahmed"}
--   Edit 2: {cropType: "Wheat"}
--   Edit 3: {cropType: "Corn"}
-- This view returns: {holderName: "Ahmed", cropType: "Corn"} — both fields merged.
-- Old approach would only return Edit 3's payload, losing the holderName change.

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
  'Unified export dataset: fully-merged holdings (all edits applied) from holdings_with_merged_edits and added_holdings_with_merged_edits, plus cities metadata. Source for the Excel export pipeline. All fields are at their latest values; no raw payloads returned.';
