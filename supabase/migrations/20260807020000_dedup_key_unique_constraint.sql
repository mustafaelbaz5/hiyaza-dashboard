-- Defense-in-depth on top of the application-level guard added in
-- 20260807000000_commit_import_batch_dedup_guard.sql. That guard prevents commit_import_batch from
-- inserting a new duplicate, but nothing stops any other write path (a future RPC, a manual
-- insert, a bug in the guard's own dedup_key computation) from creating one. Now that
-- 20260807010000_dedup_holdings.sql has cleaned up every existing duplicate, a real database-level
-- constraint can finally be added — this was blocked until that cleanup ran, since a unique
-- constraint would have failed to create against the previously-dirty data.
--
-- Partial (is_stale = false only): a stale row is allowed to share a dedup_key with an active row
-- — that's the expected shape when a holding is superseded, not a duplicate in the sense this
-- constraint guards against.

create unique index holdings_active_dedup_key_unique
  on holdings (city_id, dedup_key)
  where is_stale = false;
