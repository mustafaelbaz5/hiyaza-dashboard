-- Data cleanup, not purely additive. Companion to 20260807000000_commit_import_batch_dedup_guard.sql,
-- which stopped the bleeding (no dedup guard existed, so repeated re-imports created duplicate
-- holdings rows for years). This migration cleans up the pre-existing damage: 3,957 duplicate rows
-- out of 15,294 non-stale holdings (26%), confirmed live on 2026-08-07 against production
-- bbahuyqjptojlighriyy.
--
-- Explicitly authorized by the user on 2026-08-07 after the production app was stopped, removing
-- the live-traffic constraint that originally kept this deferred (see DATABASE_MIGRATION_REVIEW.md
-- Candidate 9's sign-off precedent — same reasoning applied here).
--
-- Strategy: for each (city_id, dedup_key) group with more than one non-stale row, the earliest
-- imported row is kept (by imported_at, then id, as a stable tiebreak). Every holding_edits row and
-- every added_holdings.promoted_holding_id/parent_holding_id pointing at a non-keeper in the group
-- is repointed to the keeper BEFORE the non-keeper rows are deleted — no edit history or promotion
-- lineage is lost. Live-audited: 725 of 2,451 duplicate groups had edit history on a row that a
-- naive "keep oldest, delete rest" would have discarded; this migration merges that history onto
-- the keeper instead.
--
-- Guardrail: aborts the whole transaction (via the RAISE EXCEPTION checks) if post-repoint totals
-- don't match expectations, rather than partially applying.

begin;

create temporary table dedup_keepers as
select distinct on (city_id, dedup_key)
  city_id, dedup_key, id as keeper_id
from holdings
where is_stale = false
order by city_id, dedup_key, imported_at asc, id asc;

create temporary table dedup_non_keepers as
select h.id as non_keeper_id, dk.keeper_id
from holdings h
join dedup_keepers dk on dk.city_id = h.city_id and dk.dedup_key = h.dedup_key
where h.is_stale = false
  and h.id <> dk.keeper_id;

-- Sanity check against the live-audited number before making any change.
do $$
declare
  v_count int;
begin
  select count(*) into v_count from dedup_non_keepers;
  if v_count <> 3957 then
    raise exception 'Expected 3957 non-keeper duplicate rows, found %. Aborting — data has changed since this migration was scoped.', v_count;
  end if;
end $$;

-- Repoint holding_edits from every non-keeper onto its group's keeper.
update holding_edits he
set holding_id = dnk.keeper_id
from dedup_non_keepers dnk
where he.holding_id = dnk.non_keeper_id
  and he.holding_type = 'holding';

-- Repoint added_holdings promotion/parent lineage the same way.
update added_holdings ah
set promoted_holding_id = dnk.keeper_id
from dedup_non_keepers dnk
where ah.promoted_holding_id = dnk.non_keeper_id;

update added_holdings ah
set parent_holding_id = dnk.keeper_id
from dedup_non_keepers dnk
where ah.parent_holding_id = dnk.non_keeper_id;

-- Verify nothing still points at a row about to be deleted.
do $$
declare
  v_dangling_edits int;
  v_dangling_promoted int;
  v_dangling_parent int;
begin
  select count(*) into v_dangling_edits
  from holding_edits he
  join dedup_non_keepers dnk on dnk.non_keeper_id = he.holding_id
  where he.holding_type = 'holding';

  select count(*) into v_dangling_promoted
  from added_holdings ah
  join dedup_non_keepers dnk on dnk.non_keeper_id = ah.promoted_holding_id;

  select count(*) into v_dangling_parent
  from added_holdings ah
  join dedup_non_keepers dnk on dnk.non_keeper_id = ah.parent_holding_id;

  if v_dangling_edits <> 0 or v_dangling_promoted <> 0 or v_dangling_parent <> 0 then
    raise exception 'Repoint incomplete: % dangling holding_edits, % dangling promoted_holding_id, % dangling parent_holding_id. Aborting.',
      v_dangling_edits, v_dangling_promoted, v_dangling_parent;
  end if;
end $$;

-- Now safe to delete: every reference has been moved to the keeper.
delete from holdings h
using dedup_non_keepers dnk
where h.id = dnk.non_keeper_id;

-- Final verification against the pre-flight baseline captured before this migration ran.
do $$
declare
  v_holdings_count int;
  v_edits_count int;
  v_added_holdings_count int;
begin
  select count(*) into v_holdings_count from holdings where is_stale = false;
  select count(*) into v_edits_count from holding_edits;
  select count(*) into v_added_holdings_count from added_holdings;

  if v_holdings_count <> 11337 then
    raise exception 'Expected 11337 holdings after dedup, found %. Aborting.', v_holdings_count;
  end if;
  if v_edits_count <> 26729 then
    raise exception 'Expected 26729 holding_edits preserved (none deleted), found %. Aborting.', v_edits_count;
  end if;
  if v_added_holdings_count <> 820 then
    raise exception 'Expected 820 added_holdings preserved (none deleted), found %. Aborting.', v_added_holdings_count;
  end if;
end $$;

drop table dedup_keepers;
drop table dedup_non_keepers;

commit;
