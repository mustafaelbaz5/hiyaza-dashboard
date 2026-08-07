-- Rollback for 20260806150500_holding_edits_idempotency_staleness.sql. Safe at any time.

drop trigger if exists set_target_was_stale_trigger on holding_edits;
drop function if exists set_target_was_stale();
alter table holding_edits drop column if exists target_was_stale;
alter table holding_edits drop column if exists operation_id;
