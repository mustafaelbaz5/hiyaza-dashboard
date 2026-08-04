-- holdings_with_merged_edits (20260801200650) also selects h.created_at/h.updated_at, which,
-- like the 8 columns added in 20260801200625, turned out to be missing from the live `holdings`
-- table's base schema. added_holdings already has both. Nullable created_at would be unusual for
-- an existing table with rows, so default both to now() for new rows and backfill existing rows
-- to their imported_at value (the closest meaningful "created" timestamp already on every row)
-- rather than leaving them null.

alter table holdings
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update holdings set created_at = imported_at, updated_at = imported_at
where imported_at is not null;

comment on column holdings.created_at is 'Row creation time. Backfilled from imported_at for pre-existing rows; defaults to now() for new inserts.';
comment on column holdings.updated_at is 'Last update time. Backfilled from imported_at for pre-existing rows; defaults to now() for new inserts. Not currently auto-updated by a trigger — set explicitly by writers if needed.';
