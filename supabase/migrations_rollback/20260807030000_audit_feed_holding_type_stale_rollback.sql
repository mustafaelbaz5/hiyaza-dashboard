-- Rollback for 20260807030000_audit_feed_holding_type_stale.sql. Restores the prior view
-- definition (holding_type/target_was_stale removed from the holding_edit branch's details).

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
    jsonb_build_object('holding_id', he.holding_id, 'payload', he.payload) as details
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
