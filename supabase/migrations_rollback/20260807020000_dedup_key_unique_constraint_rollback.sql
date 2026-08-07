-- Rollback for 20260807020000_dedup_key_unique_constraint.sql. Safe at any time — drops the index
-- only, no data was rewritten to add it.

drop index if exists holdings_active_dedup_key_unique;
