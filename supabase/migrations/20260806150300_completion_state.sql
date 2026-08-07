-- Phase 1 batch 1, item 7 (DATABASE_MIGRATION_REVIEW.md). Field-worker "mark complete" signal —
-- "I copied this parcel's ID, I'm done collecting it" — distinct from and non-conflicting with the
-- existing staff/Dashboard reviewed/reviewed_at/reviewed_by workflow. See DATABASE_REFERENCE.md
-- §4.7, SYSTEM_DESIGN.md §10.
--
-- Classification: SAFE NOW. Purely additive, nullable. Functionally inert until a future Flutter
-- release reads/writes it (explicitly named as a current Flutter Phase 2 blocker in
-- REFACTOR_ROADMAP.md) — deploying now unblocks that work without requiring it to land first.

alter table holdings
  add column if not exists completed_at timestamptz,
  add column if not exists completed_by uuid references profiles(id);

alter table added_holdings
  add column if not exists completed_at timestamptz,
  add column if not exists completed_by uuid references profiles(id);
