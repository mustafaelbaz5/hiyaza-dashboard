-- Rollback for 20260806150600_national_id_format_check.sql. Safe at any time — drops the constraint
-- only, no data was rewritten to add it.

alter table added_holdings drop constraint if exists added_holdings_national_id_format;
alter table holdings drop constraint if exists holdings_national_id_format;
