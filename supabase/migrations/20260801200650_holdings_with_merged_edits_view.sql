-- Create a view that merges all edits cumulatively for each holding.
-- This is the single source of truth for the "current state" of each holding.
--
-- For each holding, this view:
-- 1. Collects all edits in chronological order
-- 2. Merges them cumulatively (edit1, then edit2, then edit3, etc.)
-- 3. Applies the merged payload to the original holding fields
-- 4. Returns ONE row per holding with all fields populated to their latest values

create or replace view holdings_with_merged_edits as
with cumulative_edits as (
  -- For each holding, accumulate all edits in order
  select
    he.holding_id,
    -- Accumulate all key-value pairs from edits, later edits override earlier ones
    (array_agg(he.payload order by he.edited_at))[array_length(array_agg(he.payload order by he.edited_at), 1)] as merged_payload
  from holding_edits he
  group by he.holding_id
)
select
  h.id,
  h.city_id,
  h.holding_id_number,
  -- Apply merged edits to each field, fallback to original if no edit exists
  coalesce((ce.merged_payload->>'holder_name')::text, h.holder_name) as holder_name,
  coalesce((ce.merged_payload->>'national_id')::text, h.national_id) as national_id,
  coalesce((ce.merged_payload->>'owner_name')::text, h.owner_name) as owner_name,
  coalesce((ce.merged_payload->>'land_number')::text, h.land_number) as land_number,
  coalesce((ce.merged_payload->>'page_number')::text, h.page_number) as page_number,
  coalesce((ce.merged_payload->>'directorate')::text, h.directorate) as directorate,
  coalesce((ce.merged_payload->>'administration')::text, h.administration) as administration,
  coalesce((ce.merged_payload->>'basin_name')::text, h.basin_name) as basin_name,
  coalesce((ce.merged_payload->>'basin_code')::text, h.basin_code) as basin_code,
  coalesce((ce.merged_payload->>'association_name')::text, h.association_name) as association_name,
  coalesce((ce.merged_payload->>'border_east')::text, h.border_east) as border_east,
  coalesce((ce.merged_payload->>'border_south')::text, h.border_south) as border_south,
  coalesce((ce.merged_payload->>'border_west')::text, h.border_west) as border_west,
  coalesce((ce.merged_payload->>'border_north')::text, h.border_north) as border_north,
  coalesce((ce.merged_payload->>'feddan')::float, h.feddan) as feddan,
  coalesce((ce.merged_payload->>'qirat')::float, h.qirat) as qirat,
  coalesce((ce.merged_payload->>'sahm')::float, h.sahm) as sahm,
  coalesce((ce.merged_payload->>'total_sqm')::float, h.total_sqm) as total_sqm,
  coalesce((ce.merged_payload->>'crop_type')::text, h.crop_type) as crop_type,
  coalesce((ce.merged_payload->>'notes')::text, h.notes) as notes,
  coalesce((ce.merged_payload->>'credit_type')::text, h.credit_type) as credit_type,
  coalesce((ce.merged_payload->>'usage_type')::text, h.usage_type) as usage_type,
  coalesce((ce.merged_payload->>'reform_type')::text, h.reform_type) as reform_type,
  coalesce((ce.merged_payload->>'is_inheritance')::boolean, h.is_inheritance) as is_inheritance,
  coalesce((ce.merged_payload->>'is_delegate')::boolean, h.is_delegate) as is_delegate,
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
