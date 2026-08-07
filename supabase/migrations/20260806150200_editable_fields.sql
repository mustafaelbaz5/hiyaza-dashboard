-- Phase 1 batch 1, item 3a (DATABASE_MIGRATION_REVIEW.md). Shared source of truth for which fields
-- a holding_edits.payload correction may touch, plus a WARN-ONLY trigger that logs (via RAISE
-- WARNING, never rejects) any payload key not in this table. See DATABASE_REFERENCE.md §4.3, §7.2.
--
-- Classification: SAFE NOW as warn-only. Do NOT switch this trigger to reject-mode without a
-- separate migration and an observation window — see item 3b in DATABASE_MIGRATION_REVIEW.md.
--
-- Seed data note: seeded from the UNION of the dashboard's EDITABLE_FIELDS
-- (src/features/holdings/core/editable-fields.ts) and the Flutter app's actual
-- Parcel.toEditableJson()/toFieldAddedJson() payload keys (confirmed by reading
-- lib/features/holdings/domain/entities/parcel.dart directly, not assumed) — the dashboard's list
-- alone is missing 11 fields the live Flutter app already sends (owner_name, crop_type, notes,
-- credit_type, reform_type, is_inheritance, is_delegate, usage_type, holder_name_farmer_card,
-- owner_name_farmer_card, growth_stages). Seeding from the dashboard list alone would have made
-- every real Flutter edit log a spurious "unknown key" warning.
--
-- CORRECTION (verified against live payloads on bbahuyqjptojlighriyy before applying): the app's
-- real payloads also always carry a structural `holdingId` key (the holding's business id number,
-- not a correction field) that isn't in Parcel.toEditableJson()'s explicit field list scan above.
-- Without `holding_id` seeded here, EVERY live edit would trip the warn trigger — verified directly
-- against the 3 most recent real holding_edits rows before this migration was applied. Added as a
-- recognized structural key on both tables so the warn-only trigger only fires on genuinely unknown
-- keys, not this universally-present one.

create table if not exists editable_fields (
  field_name       text not null,
  applies_to_table text not null check (applies_to_table in ('holdings', 'added_holdings')),
  added_at         timestamptz not null default now(),
  primary key (field_name, applies_to_table)
);

insert into editable_fields (field_name, applies_to_table)
select field_name, applies_to_table
from (values
  ('holder_name', 'holdings'), ('holder_name', 'added_holdings'),
  ('national_id', 'holdings'), ('national_id', 'added_holdings'),
  ('land_number', 'holdings'), ('land_number', 'added_holdings'),
  ('page_number', 'holdings'), ('page_number', 'added_holdings'),
  ('basin_name', 'holdings'), ('basin_name', 'added_holdings'),
  ('basin_code', 'holdings'), ('basin_code', 'added_holdings'),
  ('association_name', 'holdings'), ('association_name', 'added_holdings'),
  ('administration', 'holdings'), ('administration', 'added_holdings'),
  ('directorate', 'holdings'), ('directorate', 'added_holdings'),
  ('border_east', 'holdings'), ('border_east', 'added_holdings'),
  ('border_west', 'holdings'), ('border_west', 'added_holdings'),
  ('border_south', 'holdings'), ('border_south', 'added_holdings'),
  ('border_north', 'holdings'), ('border_north', 'added_holdings'),
  ('feddan', 'holdings'), ('feddan', 'added_holdings'),
  ('qirat', 'holdings'), ('qirat', 'added_holdings'),
  ('sahm', 'holdings'), ('sahm', 'added_holdings'),
  ('total_sqm', 'holdings'), ('total_sqm', 'added_holdings'),
  ('owner_name', 'holdings'), ('owner_name', 'added_holdings'),
  ('crop_type', 'holdings'), ('crop_type', 'added_holdings'),
  ('notes', 'holdings'), ('notes', 'added_holdings'),
  ('credit_type', 'holdings'), ('credit_type', 'added_holdings'),
  ('reform_type', 'holdings'), ('reform_type', 'added_holdings'),
  ('is_inheritance', 'holdings'), ('is_inheritance', 'added_holdings'),
  ('is_delegate', 'holdings'), ('is_delegate', 'added_holdings'),
  ('usage_type', 'holdings'), ('usage_type', 'added_holdings'),
  ('holder_name_farmer_card', 'holdings'), ('holder_name_farmer_card', 'added_holdings'),
  ('owner_name_farmer_card', 'holdings'), ('owner_name_farmer_card', 'added_holdings'),
  ('growth_stages', 'holdings'), ('growth_stages', 'added_holdings'),
  ('holding_id', 'holdings'), ('holding_id', 'added_holdings')
) as seed(field_name, applies_to_table)
on conflict (field_name, applies_to_table) do nothing;

-- Warn-only validation: payload keys are the Flutter app's camelCase Dart field names, not this
-- table's snake_case field_name values, so the check normalizes camelCase -> snake_case before
-- comparing (mirrors src/features/holdings/core/merge-holding.ts's EDIT_PAYLOAD_KEY_MAP logic).
create or replace function warn_on_unknown_edit_payload_keys()
returns trigger
language plpgsql
as $$
declare
  known_snake_keys text[];
  raw_key text;
  snake_key text;
begin
  select array_agg(field_name) into known_snake_keys from editable_fields;

  for raw_key in select jsonb_object_keys(new.payload)
  loop
    -- camelCase -> snake_case
    snake_key := lower(regexp_replace(raw_key, '([A-Z])', '_\1', 'g'));
    if snake_key <> all(coalesce(known_snake_keys, array[]::text[])) then
      raise warning 'holding_edits.payload contains a key not in editable_fields: % (edit id %)', raw_key, new.id;
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists warn_on_unknown_edit_payload_keys_trigger on holding_edits;
create trigger warn_on_unknown_edit_payload_keys_trigger
  before insert on holding_edits
  for each row
  execute function warn_on_unknown_edit_payload_keys();
