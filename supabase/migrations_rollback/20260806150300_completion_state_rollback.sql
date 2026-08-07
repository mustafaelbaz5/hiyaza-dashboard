-- Rollback for 20260806150300_completion_state.sql.

alter table added_holdings drop column if exists completed_by;
alter table added_holdings drop column if exists completed_at;
alter table holdings drop column if exists completed_by;
alter table holdings drop column if exists completed_at;
