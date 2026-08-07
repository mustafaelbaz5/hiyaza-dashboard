-- Phase 1 batch 1, item 2 (DATABASE_MIGRATION_REVIEW.md). holding_edits.holding_id has no real FK —
-- it points at either holdings.id or added_holdings.id, and nothing in the schema says which. This
-- column makes that explicit and queryable instead of leaving both apps to guess from context. See
-- DATABASE_REFERENCE.md §4.2, §7.1.
--
-- Classification: SAFE NOW. Zero Flutter dependency (0 .rpc() calls found; the app never reads or
-- writes this column). Old rows default to 'holding', which is only an approximation for whichever
-- old rows actually point at added_holdings — full trust on historical data needs the legacy
-- id/client_id backfill (item 12, deferred/sign-off gated), but new rows are unambiguous immediately.

alter table holding_edits
  add column if not exists holding_type text not null default 'holding'
    check (holding_type in ('holding', 'added_holding'));
