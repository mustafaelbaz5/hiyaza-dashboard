-- Phase 1 batch 1, item 1 (DATABASE_MIGRATION_REVIEW.md). Registry table replacing the 2-value
-- association_type enum, so a new association type is a Dashboard-managed row instead of a schema
-- migration + app redeploy. Purely additive: the existing `cities.association_type` enum column is
-- untouched and remains the live source of truth for existing field-gating logic until the Dashboard
-- is updated to read/write association_type_code. See DATABASE_REFERENCE.md §4.1, §7.1.
--
-- Classification: SAFE NOW. No Flutter dependency (app never reads association_type_code). No
-- production impact until the Dashboard writes to the new column.

create table if not exists association_types (
  code       text primary key,
  label_ar   text not null,
  label_en   text,
  sort_order int not null default 0
);

insert into association_types (code, label_ar, label_en, sort_order) values
  ('agricultural_credit', 'ائتمان زراعي', 'Agricultural Credit', 1),
  ('agricultural_reform', 'إصلاح زراعي', 'Agricultural Reform', 2)
on conflict (code) do nothing;

alter table cities
  add column if not exists association_type_code text references association_types(code);
