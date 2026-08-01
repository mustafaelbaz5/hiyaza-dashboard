-- Generic append-only admin action log backing the Activity Log feature. One table for both
-- city-management and user-management events (create/rename/archive/restore/delete/set_role/
-- set_active/invite) rather than two dedicated tables, since both have the identical shape
-- (who did what to which entity when) — this also makes future action categories trivial to add
-- without new tables. Read via the audit_feed view (extended in a later migration), not queried
-- directly by the frontend.

create table admin_actions (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid references profiles(id),
  action_type  text not null,
  entity_type  text not null,
  entity_id    uuid not null,
  entity_name  text,
  details      jsonb not null default '{}',
  created_at   timestamptz not null default now()
);

create index admin_actions_entity_idx on admin_actions (entity_type, entity_id);
create index admin_actions_created_idx on admin_actions (created_at desc);

alter table admin_actions enable row level security;

-- Read policy matches the cities_read/holdings_read staff-read pattern.
create policy admin_actions_read on admin_actions for select
  using (current_role_is(array['admin','editor','viewer']::user_role[]));

-- Append-only by construction, matching the holding_edits immutability pattern: no update/delete
-- policy exists at all, so those operations are refused regardless of role.
create policy admin_actions_insert on admin_actions for insert
  with check (actor_id = auth.uid());

comment on table admin_actions is
  'Append-only log of administrative actions (city and user management) backing the Activity Log / audit_feed view. No update/delete policy — immutable by construction.';
