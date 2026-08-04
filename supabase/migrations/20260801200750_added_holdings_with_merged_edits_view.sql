-- Create a view that merges all edits cumulatively for each added_holdings record.
-- Same pattern as holdings_with_merged_edits but for records in added_holdings table.

create or replace view added_holdings_with_merged_edits as
with cumulative_edits as (
  -- For each added_holding, accumulate all edits in order
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
  coalesce((ce.merged_payload->>'holder_name')::text, ah.holder_name) as holder_name,
  coalesce((ce.merged_payload->>'national_id')::text, ah.national_id) as national_id,
  coalesce((ce.merged_payload->>'owner_name')::text, ah.owner_name) as owner_name,
  coalesce((ce.merged_payload->>'land_number')::text, ah.land_number) as land_number,
  coalesce((ce.merged_payload->>'page_number')::text, ah.page_number) as page_number,
  coalesce((ce.merged_payload->>'directorate')::text, ah.directorate) as directorate,
  coalesce((ce.merged_payload->>'administration')::text, ah.administration) as administration,
  coalesce((ce.merged_payload->>'basin_name')::text, ah.basin_name) as basin_name,
  coalesce((ce.merged_payload->>'basin_code')::text, ah.basin_code) as basin_code,
  coalesce((ce.merged_payload->>'association_name')::text, ah.association_name) as association_name,
  coalesce((ce.merged_payload->>'border_east')::text, ah.border_east) as border_east,
  coalesce((ce.merged_payload->>'border_south')::text, ah.border_south) as border_south,
  coalesce((ce.merged_payload->>'border_west')::text, ah.border_west) as border_west,
  coalesce((ce.merged_payload->>'border_north')::text, ah.border_north) as border_north,
  coalesce((ce.merged_payload->>'feddan')::float, ah.feddan) as feddan,
  coalesce((ce.merged_payload->>'qirat')::float, ah.qirat) as qirat,
  coalesce((ce.merged_payload->>'sahm')::float, ah.sahm) as sahm,
  coalesce((ce.merged_payload->>'total_sqm')::float, ah.total_sqm) as total_sqm,
  coalesce((ce.merged_payload->>'crop_type')::text, ah.crop_type) as crop_type,
  coalesce((ce.merged_payload->>'notes')::text, ah.notes) as notes,
  coalesce((ce.merged_payload->>'credit_type')::text, ah.credit_type) as credit_type,
  coalesce((ce.merged_payload->>'usage_type')::text, ah.usage_type) as usage_type,
  coalesce((ce.merged_payload->>'reform_type')::text, ah.reform_type) as reform_type,
  coalesce((ce.merged_payload->>'is_inheritance')::boolean, ah.is_inheritance) as is_inheritance,
  coalesce((ce.merged_payload->>'is_delegate')::boolean, ah.is_delegate) as is_delegate,
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
