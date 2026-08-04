-- The unified export dataset: merges holdings (canonical, no union/double-count — every
-- added_holdings row is already promoted into a holdings row via auto_approve_added_holding,
-- 20260801000007) with added_holdings (left-joined only to recover fields the promote trigger
-- never copied: credit_type, crop_type, is_delegate, is_inheritance, notes, owner_name) and a
-- dual-key edit-payload overlay (direct id, or legacy_edit_key/client_id for the pre-migration
-- added_holdings rows where id diverged from client_id — see DASHBOARD_ID_ALIGNMENT.md).
--
-- Additive only: reads from holding_edits_latest (defined in the Flutter app's own repo) without
-- modifying it, and does not touch the auto-approve trigger or any other existing object — same
-- safety reasoning as the earlier city_top_holders incident this session.
--
-- Edit-payload overlay application (mergeHolding/normalizeEditPayload) stays in TypeScript; this
-- view resolves joins only.

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

comment on view unified_holdings_export is
  'Unified export dataset: holdings (canonical) + added_holdings-only fields + edit-payload overlay (dual-key: id or legacy client_id) + cities join. Source for the Excel export pipeline. Edit-payload overlay application happens in TypeScript (normalizeEditPayload/mergeHolding), not in this view.';
