-- Rollback for 20260806150400_added_holdings_soft_delete.sql.

alter table added_holdings drop column if exists deleted_by;
alter table added_holdings drop column if exists deleted_at;
