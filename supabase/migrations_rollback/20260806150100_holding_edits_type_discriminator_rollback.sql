-- Rollback for 20260806150100_holding_edits_type_discriminator.sql.

alter table holding_edits drop column if exists holding_type;
