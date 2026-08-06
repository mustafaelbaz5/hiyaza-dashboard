-- Rollback for 20260806150000_association_types.sql. Safe at any time — purely additive forward
-- migration, nothing downstream depends on association_type_code yet.

alter table cities drop column if exists association_type_code;
drop table if exists association_types;
