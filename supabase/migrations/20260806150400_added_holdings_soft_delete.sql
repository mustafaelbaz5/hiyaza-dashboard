-- Phase 1 batch 1, item 8 (DATABASE_MIGRATION_REVIEW.md). Lets a field worker "delete" an added
-- parcel from every view immediately while the row and its full holding_edits history remain in the
-- database for audit — resolves the conflict between "delete it, I don't want to see it anymore" and
-- "nothing is temporary" (PROJECT_OBJECTIVES.md §6, SYSTEM_DESIGN.md §11).
--
-- Classification: SAFE NOW. Purely additive, nullable. Existing queries keep returning these rows
-- unfiltered until Flutter Phase 2 and the Dashboard both add `deleted_at is null` filters — no
-- existing behavior changes on deploy.

alter table added_holdings
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references profiles(id);
