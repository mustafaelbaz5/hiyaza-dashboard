-- REFACTOR_ROADMAP.md Phase 3: "Audit trail updated to use the holding_type discriminator (Phase 1)
-- instead of guessing which table an edit's holding_id belongs to; a new orphaned/conflicting edits
-- filter over target_was_stale, reusing the existing review-queue UI pattern."
--
-- Adds holding_type and target_was_stale into the holding_edit branch's `details` jsonb so the
-- Dashboard audit feed can filter/display them without an extra per-row query. Purely additive —
-- the view's column shape (entity_type, entity_id, city_id, user_id, occurred_at, details) is
-- unchanged; only the holding_edit branch's `details` object gains two new keys.

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
    'holding_edit'::text as entity_type,
    he.id as entity_id,
    he.city_id,
    he.edited_by as user_id,
    he.edited_at as occurred_at,
    jsonb_build_object(
      'holding_id', he.holding_id,
      'payload', he.payload,
      'holding_type', he.holding_type,
      'target_was_stale', he.target_was_stale
    ) as details
  from holding_edits he

  union all

  select
    'added_holding'::text as entity_type,
    ah.id as entity_id,
    ah.city_id,
    coalesce(ah.reviewed_by, ah.created_by) as user_id,
    coalesce(ah.reviewed_at, ah.updated_at) as occurred_at,
    jsonb_build_object(
      'status', ah.status,
      'holder_name', ah.holder_name,
      'rejection_reason', ah.rejection_reason,
      'promoted_holding_id', ah.promoted_holding_id
    ) as details
  from added_holdings ah

  union all

  select
    'city_management'::text as entity_type,
    aa.id as entity_id,
    aa.entity_id as city_id,
    aa.actor_id as user_id,
    aa.created_at as occurred_at,
    jsonb_build_object('action_type', aa.action_type, 'entity_name', aa.entity_name) || aa.details as details
  from admin_actions aa
  where aa.entity_type = 'city'::text

  union all

  select
    'user_management'::text as entity_type,
    aa.id as entity_id,
    aa.entity_id as city_id,
    aa.actor_id as user_id,
    aa.created_at as occurred_at,
    jsonb_build_object('action_type', aa.action_type, 'entity_name', aa.entity_name) || aa.details as details
  from admin_actions aa
  where aa.entity_type = 'user'::text;
