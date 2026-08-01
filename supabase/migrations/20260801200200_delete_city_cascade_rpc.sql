-- Cascading city delete for admins. The existing cities.delete() is intentionally safe-by-FK
-- (on delete restrict from holdings/import_batches) and stays that way — this RPC is a separate,
-- deliberately harder-to-trigger path for permanently destroying a city and everything under it.
--
-- security definer (not invoker) because it must bypass the on delete restrict FKs that make the
-- plain delete safe; the admin-only check is therefore done explicitly inside the function body
-- rather than relying on RLS, mirroring commit_import_batch's authorization pattern.
--
-- Logs to admin_actions BEFORE deleting, so the city's name is still resolvable in the log after
-- the row is gone. Deletes children before the parent explicitly, rather than relying on FK
-- cascade behavior that may differ across environments.

create or replace function delete_city_cascade(p_city_id uuid) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_city_name text;
begin
  if not current_role_is(array['admin']::user_role[]) then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  select name into v_city_name from cities where id = p_city_id;
  if v_city_name is null then
    raise exception 'city not found';
  end if;

  insert into admin_actions (actor_id, action_type, entity_type, entity_id, entity_name, details)
  values (
    auth.uid(), 'delete', 'city', p_city_id, v_city_name,
    jsonb_build_object(
      'holdings_count', (select count(*) from holdings where city_id = p_city_id),
      'added_holdings_count', (select count(*) from added_holdings where city_id = p_city_id),
      'import_batches_count', (select count(*) from import_batches where city_id = p_city_id)
    )
  );

  delete from quality_snapshots where city_id = p_city_id;
  delete from holding_edits where city_id = p_city_id;
  delete from added_holdings where city_id = p_city_id;
  delete from holdings where city_id = p_city_id;
  delete from import_batches where city_id = p_city_id;
  delete from cities where id = p_city_id;
end;
$$;

comment on function delete_city_cascade is
  'Admin-only permanent delete of a city and all its holdings/added_holdings/holding_edits/import_batches/quality_snapshots. Irreversible. Logs to admin_actions before deleting. Distinct from the safe cities.delete() path, which refuses to delete cities with data.';
