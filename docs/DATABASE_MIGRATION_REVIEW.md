# HiyazaFinder — Database Migration Review

**Status (2026-08-06): Batch 1 migration files written, NOT applied.** This document consolidates
every migration decided in `DATABASE_REFERENCE.md` (§4, §7) and `REFACTOR_ROADMAP.md` (Phase 1/4)
into one reviewable list. Batch 1 (items 1, 2, 3a, 7, 8, 9, 10) now has real SQL files in
`supabase/migrations/` (dated `20260806150000`–`20260806150600`) plus a matching rollback file per
migration in `supabase/migrations_rollback/` (never applied automatically by Supabase tooling — that
folder is intentionally outside the CLI's migrations path). Items 11 and 12 remain design-only per
their own gating below (11 needs a staging verification pass; 12 needs explicit sign-off).

**Nothing has been executed. Supabase has not been modified.** Writing the files and applying them
remain separate, explicitly gated steps — these files are deployment-ready, not deployed.

**Source of truth for every claim below:** live queries against the production Supabase project
`bbahuyqjptojlighriyy` (`list_migrations`, `execute_sql` — read-only `SELECT`/catalog introspection
only) run 2026-08-06, cross-checked against `database.types.ts`, both codebases' actual queries, and
the Flutter repo's `DATABASE_REFERENCE.md`/`REFACTOR_ROADMAP.md`. See those two documents for full
per-item alternatives-considered reasoning; this document is the execution-ready summary.

---

## Summary table

| # | Migration | Objective | Affected tables | Risk | Production impact | Rollback | Flutter dep | Dashboard dep | Deployment recommendation |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `association_types` reference table | Replace 2-value enum with a registry so new types don't need schema migration + redeploy | new `association_types`; `cities` (+ nullable `association_type_code`) | Low | None until Dashboard writes to new column | Drop table, drop column | None | Enables future mgmt UI (not built yet) | **Deploy now**, batch 1 |
| 2 | `holding_edits.holding_type` discriminator | Make explicit which table `holding_id` points at (`holdings` vs `added_holdings`) | `holding_edits` (+ `not null default 'holding'` column) | Low | None — column unread by any live query | Drop column | None (0 `.rpc()` calls found; column not referenced by app writes) | Enables reliable audit-trail queries later | **Deploy now**, batch 1 |
| 3a | `editable_fields` table + **warn-only** validation trigger | Shared source of truth for editable field names; log (not reject) unknown `holding_edits.payload` keys | new `editable_fields`; new trigger on `holding_edits` (warn-only) | Low as warn-only | None — trigger only logs, never rejects | Drop trigger, drop table | None while warn-only | Seed data must be diffed against current payload key list before any future reject-mode switch | **Deploy now**, batch 1 |
| 3b | `editable_fields` trigger → **reject-mode** | Actually enforce the field allowlist | same trigger, mode flip only | **Medium** | Can reject a live Flutter write if seed list is incomplete | Revert trigger to warn-only | **Yes — direct write-rejection risk if under-seeded** | — | **Not in this batch.** Separate step, after an observation window with zero unknown-key events logged by 3a |
| 4 | `added_holdings.reform_type` | — | — | — | — | — | — | — | **No migration — already live**, confirmed via column comment |
| 5 | `city_top_holders` refresh automation | — | — | — | — | — | — | — | **No migration — retired as moot.** Live-verified plain view, not materialized; no refresh step exists |
| 6 | `persons` table | — | — | — | — | — | — | — | **Not building.** Superseded by live `person_id`, which is correct and sufficient |
| 6b | `person_client_id` | — | — | — | — | — | — | — | **Not building.** Confirmed absent from live schema — no such column exists; only doc/migration-file cleanup needed in the Flutter repo |
| 7 | Completion state (`completed_at`/`completed_by`) | New field-worker "mark complete" signal, distinct from staff `reviewed` | `holdings`, `added_holdings` (+ nullable columns, + FK to `profiles`) | Low | None until Flutter Phase 2 reads/writes it | Drop columns | None yet (blocks a future Flutter release, doesn't touch a current one) | None yet | **Deploy now**, batch 1 — unblocks Flutter Phase 2 |
| 8 | Soft delete (`deleted_at`/`deleted_by`) on `added_holdings` | Let a field worker hide an added parcel while preserving its full edit history | `added_holdings` (+ nullable columns, + FK) | Low | None — existing queries keep returning these rows until filtered | Drop columns | None yet | None yet | **Deploy now**, batch 1 |
| 9 | Sync idempotency (`operation_id`, `target_was_stale`) | General-purpose retry-safety key + staleness flag on writes, independent of the (abandoned) offline outbox | `holding_edits` (+ nullable unique column, + `not null default false` column, + new trigger) | Low | None until populated by a client | Drop trigger, drop columns | None yet | None yet | **Deploy now**, batch 1 |
| 10 | National ID format `CHECK` | Server-side 14-digit format enforcement, matching existing client-side validation | `holdings.national_id`, `added_holdings.national_id` (+ `CHECK`, added `VALID`) | Low | **Live-audited: zero risk.** Only 1 non-conforming row per table, both the known `'1111111111'` placeholder, explicitly exempted in the constraint | Drop constraint | None (constraint only rejects new malformed writes; existing data is 100% compliant once placeholder is exempted) | None | **Deploy now**, batch 1 |
| 11 | `commit_import_batch` dedup guard | Add `ON CONFLICT (city_id, dedup_key) DO NOTHING`; wire the already-present-but-hardcoded `rowsDuplicate` response field to a real count | `commit_import_batch` function body only (no table DDL) | **Medium** | **Live-verified: the function currently has zero duplicate-import protection at all** — a behavior change to existing, load-bearing logic, not a new object | Revert function to current definition (captured in `DATABASE_REFERENCE.md` §7.4) | None (0 `.rpc()` calls in Flutter) | **Yes — import UI's "duplicate rows" summary should be wired to the real count once this ships** | **Separate, isolated deploy** — needs a staging test-import pass (duplicate file / fresh file / partial-overlap file) before going live; never bundled with batch 1 |
| 12 | Legacy `id`/`client_id` backfill | Fix 353 `added_holdings` rows where `id ≠ client_id`, whose `holding_edits.holding_id` is keyed to `client_id` not `id` | `added_holdings.id` (rewrite 353 rows), `holding_edits.holding_id` (repoint corresponding rows) | **High** | Rewrites already-synced production rows and repoints keys in an append-only audit table | Requires a captured pre-change snapshot to reverse precisely — not a trivial `DROP` | Should be transparent to the app if scripted correctly | Should be transparent if scripted correctly | **Deferred to Phase 4 — explicit sign-off required**, run inside one transaction with before/after row-count + checksum verification |
| 13 | `is_stale` column/index/filter cleanup | Remove the vestigial staleness flag — nothing has set it `true` since `20260801000013_remove_stale_marking.sql`; it is a functional no-op today | `holdings.is_stale`, its index, all `is_stale=false` filter clauses across dashboard queries/views | Low-Medium (removal, not additive) | Needs a full grep of every reader before removal — not assumed safe just because the value never changes today | Requires restoring the column and re-deriving semantics — not trivial once dropped | Needs confirmation no Flutter code path depends on its presence | Needs confirmation no dashboard query depends on its presence | **Optional cleanup — not in this phase.** No urgency; do only once fully verified unused |

---

## Deployment order

**Batch 1 — additive, zero-dependency, deploy together (items 1, 2, 3a, 7, 8, 9, 10):**
None of these seven depends on another. Each is a pure schema addition — new table, new nullable
column, or a constraint validated against live-audited-clean data. Safe to write, review, and deploy
as a single reviewed batch. Zero Flutter application-code dependency for any of them (confirmed via
direct grep: the live Flutter app makes zero `.rpc()` calls and none of its `.from()` calls reference
these new objects/columns).

**Isolated deploy 1 — item 11 (`commit_import_batch` dedup guard):**
Deployed on its own, after batch 1, gated on a staging verification pass (test-import a duplicate file,
a fresh file, and a partial-overlap file; confirm `rowsDuplicate` reflects reality and no legitimate
rows are rejected). Not bundled with batch 1 because it changes existing function behavior rather than
adding a new object — isolating it means a problem here is trivially traced and rolled back without
touching the unrelated additive work.

**Isolated deploy 2 — item 3b (`editable_fields` reject-mode):**
Deployed only after an observation window on item 3a's warn-only logging shows zero unknown-key events
from either app's current traffic. No fixed timeline is set here — the gate is "zero unknown-key
observations," not a calendar date.

**Deferred, sign-off gated — item 12 (legacy id/client_id backfill):**
Not scheduled as part of this phase. Requires your explicit go-ahead separately from batch 1's
approval, tracked under `REFACTOR_ROADMAP.md` Phase 4.

**Optional, unscheduled — item 13 (`is_stale` cleanup):**
No deployment recommendation at this time — do only once a full reader-usage grep confirms it's safe.

**Not migrations — retired/rejected (items 4, 5, 6, 6b):**
No SQL will be written for these; each is either already live, already correct as-is, or explicitly not
being built. Listed here only for completeness of the original candidate list.

---

## What is explicitly out of scope for every batch above

Per the standing rule governing this entire effort: the Excel import column-mapping/export schema, the
`holdings`/`holding_edits`/`added_holdings` core immutable+overlay shape, RLS policy structure, and the
`user_role`/`city_status`/`record_status` enums are not touched by any item in this review.

---

## Approval checklist

- [ ] Batch 1 (items 1, 2, 3a, 7, 8, 9, 10) approved for migration-file authoring
- [ ] Item 11 (`commit_import_batch` dedup guard) approved for migration-file authoring, with its
      verification pass acknowledged as a precondition to deployment (not to authoring)
- [ ] Item 3b (reject-mode switch) — acknowledged as a later, separately-approved step, not part of
      this round
- [ ] Item 12 (legacy backfill) — explicit sign-off still pending, tracked separately
- [ ] Item 13 (`is_stale` cleanup) — acknowledged as optional/unscheduled

**Next step after your approval:** write the migration SQL files (+ matching rollback files) for the
approved batch(es) only, into `supabase/migrations/`, per the deployment order above. No file will be
applied to Supabase — writing and applying remain separate, explicitly gated steps.
