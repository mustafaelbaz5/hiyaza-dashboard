-- Extends audit_feed (supabase/migrations/20260801000003_review_and_audit.sql) with 2 new arms
-- reading from admin_actions: city_management and user_management events. This is the same
-- structural pattern as the existing 3 arms (import/holding_edit/added_holding), just sourced from
-- the new generic log table instead of a dedicated one.
--
-- Caveat: the view's shared city_id column is repurposed to hold entity_id for these 2 new arms —
-- for user_management rows this is a user id, NOT a real city id. This is a pre-existing structural
-- wart (one city_id column shared across heterogeneous entity types) made worse, not introduced, by
-- this change. The frontend must not apply a city filter to user_management rows.
--
-- Before deploying: confirmed (per prior incident with city_top_holders) that audit_feed has no
-- other consumer outside this dashboard — the Flutter field app has no audit/activity-log UI and
-- does not query this view.

create or replace view audit_feed as
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
from added_holdings ah

union all

select
  'city_management'::text,
  aa.id,
  aa.entity_id,
  aa.actor_id,
  aa.created_at,
  jsonb_build_object('action_type', aa.action_type, 'entity_name', aa.entity_name) || aa.details
from admin_actions aa
where aa.entity_type = 'city'

union all

select
  'user_management'::text,
  aa.id,
  aa.entity_id,
  aa.actor_id,
  aa.created_at,
  jsonb_build_object('action_type', aa.action_type, 'entity_name', aa.entity_name) || aa.details
from admin_actions aa
where aa.entity_type = 'user';

comment on view audit_feed is
  'Unified activity feed: imports, holding edits, added holdings, plus city_management and user_management events from admin_actions. For the latter two arms, the city_id column holds the entity_id (a user id for user_management rows) — do not treat it as a literal city reference without checking entity_type.';
