-- Adds a real generated person_id, grouping a person's parcels together for export (Excel column
-- 1 "Person ID"). Two earlier proposals were rejected before this one:
--   - Using national_id directly: collides on the placeholder value '11111111111111' (used by
--     many distinct, unidentified people) and on NULL national_id — verified live at the time of
--     this migration's design: 11 holdings + 232 added_holdings rows used the placeholder, and a
--     further 176 holdings rows had NULL national_id. All of those would wrongly merge into one
--     fake "person" under a plain national_id passthrough.
--   - Using the parcel UUID as Person ID: makes Person ID identical to Holding ID (export column
--     2), defeating the point of grouping — verified live that 190 real national_id values
--     genuinely span multiple parcels each (one spans 5), which a per-parcel id can't represent.
--
-- This migration's rule, confirmed with the Flutter app's team: one shared person_id per distinct
-- REAL (non-null, non-placeholder) national_id, reused across every parcel that person owns.
-- Every row with the placeholder or a NULL national_id gets its own independently generated
-- person_id — never grouped with any other row, since neither value reliably identifies one
-- real individual.

alter table holdings add column person_id uuid;
alter table added_holdings add column person_id uuid;

-- Backfill holdings: one shared person_id per distinct real national_id.
with real_people as (
  select distinct national_id, gen_random_uuid() as new_person_id
  from holdings
  where national_id is not null and national_id <> '11111111111111'
)
update holdings h set person_id = rp.new_person_id
from real_people rp
where h.national_id = rp.national_id;

-- Every remaining holdings row (placeholder or NULL national_id) is its own person.
update holdings set person_id = gen_random_uuid() where person_id is null;

-- Backfill added_holdings identically.
with real_people as (
  select distinct national_id, gen_random_uuid() as new_person_id
  from added_holdings
  where national_id is not null and national_id <> '11111111111111'
)
update added_holdings ah set person_id = rp.new_person_id
from real_people rp
where ah.national_id = rp.national_id;

update added_holdings set person_id = gen_random_uuid() where person_id is null;

-- New added_holdings rows follow the same grouping rule going forward: reuse an existing real
-- national_id's person_id if one exists (checking both added_holdings and holdings, since a
-- person's other parcels may live in either table), otherwise generate a fresh person_id.
create or replace function assign_person_id() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing_person_id uuid;
begin
  if new.national_id is not null and new.national_id <> '11111111111111' then
    select person_id into v_existing_person_id
    from added_holdings
    where national_id = new.national_id and person_id is not null
    limit 1;

    if v_existing_person_id is null then
      select person_id into v_existing_person_id
      from holdings
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

create trigger added_holdings_assign_person_id
  before insert on added_holdings
  for each row execute function assign_person_id();

comment on column holdings.person_id is
  'Generated grouping id for a person''s parcels — one shared id per real national_id, an independent id per placeholder/NULL national_id row. See migration comment for why this is not national_id or the parcel id directly.';
comment on column added_holdings.person_id is
  'Same rule as holdings.person_id. Assigned automatically on insert by assign_person_id().';
