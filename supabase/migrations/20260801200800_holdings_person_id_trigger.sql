-- Fixes a gap in 20260801200500_person_id.sql: that migration added a person_id-assignment
-- trigger only on added_holdings, but holdings itself is inserted into from multiple places
-- (commit_import_batch and its successors, auto_approve_added_holding) — none of which set
-- person_id, and new ones may be added later. A holdings-side trigger, mirroring
-- assign_person_id(), covers every insert path uniformly instead of requiring every future
-- insert site to remember to set person_id by hand.
--
-- Confirmed live: one row (id 4b455a16-f87c-4a0d-8253-68b4bedfb946) was inserted after the
-- one-time backfill ran and before this trigger existed, leaving it with a NULL person_id — this
-- migration also fixes that specific row.

create or replace function assign_person_id_holdings() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing_person_id uuid;
begin
  if new.national_id is not null and new.national_id <> '11111111111111' then
    select person_id into v_existing_person_id
    from holdings
    where national_id = new.national_id and person_id is not null
    limit 1;

    if v_existing_person_id is null then
      select person_id into v_existing_person_id
      from added_holdings
      where national_id = new.national_id and person_id is not null
      limit 1;
    end if;

    if v_existing_person_id is not null then
      new.person_id := v_existing_person_id;
      return new;
    end if;
  end if;

  new.person_id := gen_random_uuid();
  return new;
end;
$$;

drop trigger if exists holdings_assign_person_id on holdings;
create trigger holdings_assign_person_id
  before insert on holdings
  for each row execute function assign_person_id_holdings();

-- Backfill the one row that slipped through before this trigger existed.
update holdings set person_id = gen_random_uuid() where person_id is null;
