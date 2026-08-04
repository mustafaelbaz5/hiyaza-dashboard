-- Fixes a gap in 20260801200700_unified_holdings_export_view.sql: the view's promoted CTE never
-- selected added_holdings.usage_type, so a field-added parcel with no edit-payload override for
-- usage type had no base value to fall back to (usage_type is confirmed populated, real data —
-- "زراعة" etc — on added_holdings, unlike some of the other gap columns that are genuinely empty).

drop view if exists unified_holdings_export;

create view unified_holdings_export as
with promoted as (
  select
    h.*,
    ah.client_id,
    ah.credit_type,
    ah.crop_type,
    ah.is_delegate,
    ah.is_inheritance,
    ah.notes as added_notes,
    ah.owner_name,
    ah.usage_type,
    case when ah.client_id <> ah.id then ah.client_id else null end as legacy_edit_key
  from holdings h
  left join added_holdings ah on ah.promoted_holding_id = h.id
)
select
  p.*,
  c.name as city_name,
  c.association_type,
  c.association_subtype,
  c.classification,
  c.short_code,
  coalesce(hel_new.payload, hel_legacy.payload) as latest_edit_payload
from promoted p
left join cities c on c.id = p.city_id
left join holding_edits_latest hel_new on hel_new.holding_id = p.id
left join holding_edits_latest hel_legacy
  on p.legacy_edit_key is not null and hel_legacy.holding_id = p.legacy_edit_key;
