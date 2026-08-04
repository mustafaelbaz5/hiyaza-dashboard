-- Fixes a critical bug in holdings_with_merged_edits / added_holdings_with_merged_edits
-- (20260801200650 / 20260801200750): both views extract fields from holding_edits.payload using
-- snake_case JSON keys (e.g. merged_payload->>'crop_type'), but the Flutter app writes camelCase
-- keys (cropType) — the exact same class of bug the dashboard's own TypeScript side already fixed
-- via normalizeEditPayload/EDIT_PAYLOAD_KEY_MAP (src/features/holdings/core/editable-fields.ts).
-- These two SQL views were never updated to match.
--
-- Confirmed live: a holding_edits row with payload {"cropType": "ارز", "usageType": "زراعة",
-- "creditType": "ملك", ...} produced NO change in holdings_with_merged_edits' crop_type/
-- usage_type/credit_type — silently falling through to the (empty) base holdings columns.
-- Every camelCase-keyed field was broken this way: crop_type, usage_type, credit_type,
-- reform_type, is_delegate, is_inheritance, holder_name, national_id, basin_name, basin_code,
-- land_number, owner_name, total_sqm. Only fields that happen to share the same spelling in both
-- cases (notes, feddan, qirat, sahm, directorate, administration, page_number,
-- association_name, border_east/south/west/north) worked correctly by coincidence.

create or replace view holdings_with_merged_edits as
with cumulative_edits as (
  select
    he.holding_id,
    (array_agg(he.payload order by he.edited_at))[array_length(array_agg(he.payload order by he.edited_at), 1)] as merged_payload
  from holding_edits he
  group by he.holding_id
)
select
  h.id,
  h.city_id,
  h.holding_id_number,
  coalesce((ce.merged_payload->>'holderName')::text, h.holder_name) as holder_name,
  coalesce((ce.merged_payload->>'nationalId')::text, h.national_id) as national_id,
  coalesce((ce.merged_payload->>'ownerName')::text, h.owner_name) as owner_name,
  coalesce((ce.merged_payload->>'landNumber')::text, h.land_number) as land_number,
  coalesce((ce.merged_payload->>'pageNumber')::text, h.page_number) as page_number,
  coalesce((ce.merged_payload->>'directorate')::text, h.directorate) as directorate,
  coalesce((ce.merged_payload->>'administration')::text, h.administration) as administration,
  coalesce((ce.merged_payload->>'basinName')::text, h.basin_name) as basin_name,
  coalesce((ce.merged_payload->>'basinCode')::text, h.basin_code) as basin_code,
  coalesce((ce.merged_payload->>'associationName')::text, h.association_name) as association_name,
  coalesce((ce.merged_payload->>'borderEast')::text, h.border_east) as border_east,
  coalesce((ce.merged_payload->>'borderSouth')::text, h.border_south) as border_south,
  coalesce((ce.merged_payload->>'borderWest')::text, h.border_west) as border_west,
  coalesce((ce.merged_payload->>'borderNorth')::text, h.border_north) as border_north,
  coalesce((ce.merged_payload->>'feddan')::float, h.feddan) as feddan,
  coalesce((ce.merged_payload->>'qirat')::float, h.qirat) as qirat,
  coalesce((ce.merged_payload->>'sahm')::float, h.sahm) as sahm,
  coalesce((ce.merged_payload->>'totalSqm')::float, h.total_sqm) as total_sqm,
  coalesce((ce.merged_payload->>'cropType')::text, h.crop_type) as crop_type,
  coalesce((ce.merged_payload->>'notes')::text, h.notes) as notes,
  coalesce((ce.merged_payload->>'creditType')::text, h.credit_type) as credit_type,
  coalesce((ce.merged_payload->>'usageType')::text, h.usage_type) as usage_type,
  coalesce((ce.merged_payload->>'reformType')::text, h.reform_type) as reform_type,
  coalesce((ce.merged_payload->>'isInheritance')::boolean, h.is_inheritance) as is_inheritance,
  coalesce((ce.merged_payload->>'isDelegate')::boolean, h.is_delegate) as is_delegate,
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
  h.unified_number
from holdings h
left join cumulative_edits ce on ce.holding_id = h.id;

create or replace view added_holdings_with_merged_edits as
with cumulative_edits as (
  select
    he.holding_id,
    (array_agg(he.payload order by he.edited_at))[array_length(array_agg(he.payload order by he.edited_at), 1)] as merged_payload
  from holding_edits he
  where he.holding_id in (select id from added_holdings)
  group by he.holding_id
)
select
  ah.id,
  ah.city_id,
  ah.client_id,
  ah.parent_holding_id,
  ah.holding_id_number,
  coalesce((ce.merged_payload->>'holderName')::text, ah.holder_name) as holder_name,
  coalesce((ce.merged_payload->>'nationalId')::text, ah.national_id) as national_id,
  coalesce((ce.merged_payload->>'ownerName')::text, ah.owner_name) as owner_name,
  coalesce((ce.merged_payload->>'landNumber')::text, ah.land_number) as land_number,
  coalesce((ce.merged_payload->>'pageNumber')::text, ah.page_number) as page_number,
  coalesce((ce.merged_payload->>'directorate')::text, ah.directorate) as directorate,
  coalesce((ce.merged_payload->>'administration')::text, ah.administration) as administration,
  coalesce((ce.merged_payload->>'basinName')::text, ah.basin_name) as basin_name,
  coalesce((ce.merged_payload->>'basinCode')::text, ah.basin_code) as basin_code,
  coalesce((ce.merged_payload->>'associationName')::text, ah.association_name) as association_name,
  coalesce((ce.merged_payload->>'borderEast')::text, ah.border_east) as border_east,
  coalesce((ce.merged_payload->>'borderSouth')::text, ah.border_south) as border_south,
  coalesce((ce.merged_payload->>'borderWest')::text, ah.border_west) as border_west,
  coalesce((ce.merged_payload->>'borderNorth')::text, ah.border_north) as border_north,
  coalesce((ce.merged_payload->>'feddan')::float, ah.feddan) as feddan,
  coalesce((ce.merged_payload->>'qirat')::float, ah.qirat) as qirat,
  coalesce((ce.merged_payload->>'sahm')::float, ah.sahm) as sahm,
  coalesce((ce.merged_payload->>'totalSqm')::float, ah.total_sqm) as total_sqm,
  coalesce((ce.merged_payload->>'cropType')::text, ah.crop_type) as crop_type,
  coalesce((ce.merged_payload->>'notes')::text, ah.notes) as notes,
  coalesce((ce.merged_payload->>'creditType')::text, ah.credit_type) as credit_type,
  coalesce((ce.merged_payload->>'usageType')::text, ah.usage_type) as usage_type,
  coalesce((ce.merged_payload->>'reformType')::text, ah.reform_type) as reform_type,
  coalesce((ce.merged_payload->>'isInheritance')::boolean, ah.is_inheritance) as is_inheritance,
  coalesce((ce.merged_payload->>'isDelegate')::boolean, ah.is_delegate) as is_delegate,
  ah.status,
  ah.promoted_holding_id,
  ah.created_by,
  ah.created_at,
  ah.reviewed_by,
  ah.reviewed_at,
  ah.updated_at,
  ah.person_id,
  ah.soil_type,
  ah.growth_stages,
  ah.holder_name_farmer_card,
  ah.owner_name_farmer_card
from added_holdings ah
left join cumulative_edits ce on ce.holding_id = ah.id;
