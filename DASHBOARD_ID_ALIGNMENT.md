# Parcel ID Alignment — Notes for the Dashboard Project

This is a brief for the dashboard's own Claude Code session (separate repo, see `DASHBOARD_PLAN.md`
in this repo for how the two projects relate). It documents a schema-level change just made on the
HiyazaFinder Flutter app side that affects how the dashboard should join/export data.

## What changed

`added_holdings.id` used to be server-generated (`gen_random_uuid()` default) and **different**
from the id the Flutter app used internally for a field-added parcel (`client_id` held that app-side
id separately). As of migration `20260804000016_client_supplied_added_holdings_id.sql`:

- `added_holdings.id`'s default was dropped — the Flutter app now supplies `id` explicitly on
  insert (`pushAddRecord` in `lib/features/sync/data/supabase_sync_api.dart`), using the same
  client-generated uuid it already used for `client_id`.
- A unique index (`added_holdings_client_id_key`) was added on `client_id` as a safety net.
- `holdings.id` was **already** consistent with the app's id (the app downloads `holdings` rows and
  keeps `id` verbatim) — this change only affects `added_holdings`.

**Net effect for records created from now on:** one parcel has exactly one id, and that same id is
used in the Flutter app, in `holdings`/`added_holdings`, and in `holding_edits.holding_id`. This id
is the correct join/export key going forward.

## What did NOT change — existing/legacy data

**353 existing `added_holdings` rows** (as of this migration) keep their old, already-diverged
server-generated `id` — this was not backfilled. For those rows specifically:

- `added_holdings.id` ≠ the id the Flutter app currently shows/uses for that parcel.
- `added_holdings.client_id` **does** hold the app-side id for these legacy rows (it always did).
- Any `holding_edits` row for one of these legacy parcels has `holding_id` set to the app-side id
  (matching `client_id`, not `id`) — **not** matching any row's primary key in either `holdings` or
  `added_holdings`. These edit rows are effectively orphaned under a plain `id`-based join.

Confirmed live (via `execute_sql` against project `bbahuyqjptojlighriyy`): querying `holding_edits`
left-joined to both `holdings.id` and `added_holdings.id` returns unmatched rows whose `holding_id`
does correspond to an `added_holdings.client_id` instead. This is not a hypothetical edge case —
it's already present in production data.

## Recommended export/join logic

For a single "all parcels + their current edited values" export, the join needs to account for
both eras:

```sql
-- One row per parcel from either source table, using the id that's actually
-- correct for edits to resolve against: new-era added_holdings rows use id
-- directly; legacy rows (created before the migration) resolve via client_id.
with all_parcels as (
  select id, city_id, /* ...other holdings columns... */, null::uuid as legacy_edit_key
  from holdings
  union all
  select id, city_id, /* ...other added_holdings columns... */,
         case when client_id <> id then client_id else null end as legacy_edit_key
  from added_holdings
)
select p.*, coalesce(hel_new.payload, hel_legacy.payload) as latest_edit_payload
from all_parcels p
left join holding_edits_latest hel_new
  on hel_new.holding_id = p.id
left join holding_edits_latest hel_legacy
  on p.legacy_edit_key is not null and hel_legacy.holding_id = p.legacy_edit_key;
```

`holding_edits_latest` is an existing view (see `supabase/migrations/20260731000006_holding_edits.sql`
in the app repo) — one row per `holding_id`, the most recent edit by `coalesce(client_edited_at,
edited_at)`. Apply its `payload` (a `Parcel.toEditableJson()`-shaped map) over the base row the same
way the app's `ParcelEditOverlay.apply`/`Parcel.fromEditableJson` do client-side, field-by-field, so
the exported Excel reflects current edited values rather than only the original import/creation.

## Open question for the dashboard/product side

Whether to run a one-time backfill (`update added_holdings set id = client_id where id <> client_id`,
plus a matching update on any `holding_edits.holding_id` that currently points at the old `id` value
for those rows) to fully unify legacy data onto the same id scheme, eliminating the need for the
`legacy_edit_key` fallback above. This is a decision for whoever owns both the app and dashboard data
model — not made as part of this change, since it touches already-synced production rows and (for
`holding_edits`) an append-only audit-style table.
