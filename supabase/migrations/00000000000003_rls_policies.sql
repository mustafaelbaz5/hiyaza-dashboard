-- Row Level Security. Per DASHBOARD_PLAN.md § 6.1: authorization is enforced here, not by
-- hiding UI buttons. `field` role never reaches the dashboard at all — enforced by requiring
-- an authenticated, non-disabled, non-field profile for every dashboard table.

alter table profiles enable row level security;
alter table cities enable row level security;
alter table holdings enable row level security;
alter table holding_edits enable row level security;
alter table added_holdings enable row level security;
alter table import_batches enable row level security;
alter table quality_snapshots enable row level security;

-- ---------------------------------------------------------------------------
-- Helper: current user's role, null if unauthenticated/disabled/no profile.
-- ---------------------------------------------------------------------------

create function current_dashboard_role() returns app_role as $$
  select role from profiles
  where id = auth.uid() and is_disabled = false and role <> 'field'
$$ language sql stable security definer set search_path = public;

create function is_admin() returns boolean as $$
  select current_dashboard_role() = 'admin'
$$ language sql stable security definer set search_path = public;

create function is_editor_or_admin() returns boolean as $$
  select current_dashboard_role() in ('admin', 'editor')
$$ language sql stable security definer set search_path = public;

create function is_dashboard_user() returns boolean as $$
  select current_dashboard_role() is not null
$$ language sql stable security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- profiles — every dashboard user can read all profiles (for audit/attribution display);
-- only admins can write (invite/disable/role-change happens via Phase 6 admin API).
-- ---------------------------------------------------------------------------

create policy profiles_select_dashboard_users on profiles
  for select using (is_dashboard_user());

create policy profiles_select_self on profiles
  for select using (id = auth.uid());

create policy profiles_update_admin on profiles
  for update using (is_admin());

create policy profiles_update_self_non_role on profiles
  for update using (id = auth.uid());

-- ---------------------------------------------------------------------------
-- cities — viewer+ can read; editor+ can create/update; only admin can archive/delete.
-- ---------------------------------------------------------------------------

create policy cities_select_dashboard_users on cities
  for select using (is_dashboard_user());

create policy cities_insert_editor on cities
  for insert with check (is_editor_or_admin());

create policy cities_update_editor on cities
  for update using (is_editor_or_admin());

create policy cities_delete_admin on cities
  for delete using (is_admin());

-- ---------------------------------------------------------------------------
-- holdings — viewer+ can read; editor+ can write (import pipeline, bulk edit run as editor+).
-- ---------------------------------------------------------------------------

create policy holdings_select_dashboard_users on holdings
  for select using (is_dashboard_user());

create policy holdings_insert_editor on holdings
  for insert with check (is_editor_or_admin());

create policy holdings_update_editor on holdings
  for update using (is_editor_or_admin());

create policy holdings_delete_admin on holdings
  for delete using (is_admin());

-- ---------------------------------------------------------------------------
-- holding_edits — append-only overlay. viewer+ can read; editor+ can insert; nobody updates
-- or deletes (immutable audit trail, DASHBOARD_PLAN.md § 6.6).
-- ---------------------------------------------------------------------------

create policy holding_edits_select_dashboard_users on holding_edits
  for select using (is_dashboard_user());

create policy holding_edits_insert_editor on holding_edits
  for insert with check (is_editor_or_admin() and edited_by = auth.uid());

-- ---------------------------------------------------------------------------
-- added_holdings — mobile app inserts as `field` role (uses anon/service context, not the
-- dashboard's current_dashboard_role() gate); dashboard editor+ can read/update for review.
-- ---------------------------------------------------------------------------

create policy added_holdings_select_dashboard_users on added_holdings
  for select using (is_dashboard_user());

create policy added_holdings_update_editor on added_holdings
  for update using (is_editor_or_admin());

create policy added_holdings_insert_field_app on added_holdings
  for insert with check (created_by = auth.uid());

-- ---------------------------------------------------------------------------
-- import_batches — viewer+ read (import history); editor+ write (run imports/rollback).
-- ---------------------------------------------------------------------------

create policy import_batches_select_dashboard_users on import_batches
  for select using (is_dashboard_user());

create policy import_batches_insert_editor on import_batches
  for insert with check (is_editor_or_admin() and imported_by = auth.uid());

create policy import_batches_update_editor on import_batches
  for update using (is_editor_or_admin());

-- ---------------------------------------------------------------------------
-- quality_snapshots — read-only from the UI's perspective; written by the snapshot job
-- (service role) or an editor-triggered manual snapshot.
-- ---------------------------------------------------------------------------

create policy quality_snapshots_select_dashboard_users on quality_snapshots
  for select using (is_dashboard_user());

create policy quality_snapshots_insert_editor on quality_snapshots
  for insert with check (is_editor_or_admin());

-- ---------------------------------------------------------------------------
-- Storage: imports bucket — editor+ can upload/read original workbooks.
-- ---------------------------------------------------------------------------

create policy imports_bucket_select on storage.objects
  for select using (bucket_id = 'imports' and is_dashboard_user());

create policy imports_bucket_insert on storage.objects
  for insert with check (bucket_id = 'imports' and is_editor_or_admin());
