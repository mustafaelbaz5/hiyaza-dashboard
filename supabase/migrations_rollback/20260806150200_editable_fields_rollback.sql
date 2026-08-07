-- Rollback for 20260806150200_editable_fields.sql. Safe at any time — the trigger only warns,
-- never rejects, so dropping it changes nothing about what data was ever accepted.

drop trigger if exists warn_on_unknown_edit_payload_keys_trigger on holding_edits;
drop function if exists warn_on_unknown_edit_payload_keys();
drop table if exists editable_fields;
