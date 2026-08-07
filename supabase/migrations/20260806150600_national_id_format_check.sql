-- Phase 1 batch 1, item 10 (DATABASE_MIGRATION_REVIEW.md). Server-side 14-digit Egyptian national ID
-- format enforcement, matching the client-side validation both apps already perform
-- (PROJECT_OBJECTIVES.md §6.1). The known placeholder sentinel '1111111111' (used by both apps for
-- "no real national ID on file") is explicitly exempted. See DATABASE_REFERENCE.md §4.10, §7.6.
--
-- Classification: SAFE NOW, added VALID (not NOT VALID). Live-audited against production
-- (bbahuyqjptojlighriyy) on 2026-08-06: of 15,238 holdings and 764 added_holdings rows with a
-- non-null national_id, exactly ONE row per table failed a 14-digit check, and both were the
-- placeholder '1111111111' — zero genuinely malformed rows exist. With the placeholder exempted,
-- current data is 100% compliant, so this can be validated immediately rather than staged as
-- NOT VALID. Only rejects new malformed writes going forward.

alter table holdings
  add constraint holdings_national_id_format
  check (national_id is null or national_id ~ '^\d{14}$' or national_id = '1111111111');

alter table added_holdings
  add constraint added_holdings_national_id_format
  check (national_id is null or national_id ~ '^\d{14}$' or national_id = '1111111111');
