-- Phase 1 batch 1, item 9 (DATABASE_MIGRATION_REVIEW.md). General-purpose retry-safety key
-- (operation_id) and a staleness flag (target_was_stale) set at insert time by a trigger, so an edit
-- landing on a since-superseded holding is flagged for review instead of silently orphaned. Not tied
-- to the abandoned offline sync outbox — kept as architecture-independent infrastructure. See
-- DATABASE_REFERENCE.md §4.9, §7 ("alternatives considered" writeup for why this wasn't dropped).
--
-- Classification: SAFE NOW. Purely additive, both columns nullable/defaulted. operation_id is
-- unpopulated by any current client (nullable unique allows unlimited nulls); the staleness trigger
-- only writes a flag, never rejects a write.
--
-- Depends on: 20260806150100_holding_edits_type_discriminator.sql (reads new.holding_type). Must
-- deploy after it — filename ordering already guarantees this.

alter table holding_edits
  add column if not exists operation_id uuid unique,
  add column if not exists target_was_stale boolean not null default false;

create or replace function set_target_was_stale()
returns trigger
language plpgsql
as $$
declare
  target_is_stale boolean;
begin
  if new.holding_type = 'added_holding' then
    -- added_holdings has no is_stale concept (it's not import-derived) — never flagged.
    new.target_was_stale := false;
    return new;
  end if;

  select is_stale into target_is_stale from holdings where id = new.holding_id;
  new.target_was_stale := coalesce(target_is_stale, false);
  return new;
end;
$$;

drop trigger if exists set_target_was_stale_trigger on holding_edits;
create trigger set_target_was_stale_trigger
  before insert on holding_edits
  for each row
  execute function set_target_was_stale();
