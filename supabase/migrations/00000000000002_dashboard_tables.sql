-- Dashboard-only tables — see DASHBOARD_PLAN.md § 7. Everything else lives in the shared
-- core schema (previous migration).

create table import_batches (
  id             uuid primary key default gen_random_uuid(),
  city_id        uuid not null references cities(id) on delete restrict,
  file_name      text not null,
  storage_path   text,
  status         text not null default 'pending',   -- pending|previewing|committed|failed|rolled_back
  rows_total     int  not null default 0,
  rows_imported  int  not null default 0,
  rows_rejected  int  not null default 0,
  rejection_log  jsonb,
  mapping_used   jsonb,
  imported_by    uuid not null references profiles(id),
  created_at     timestamptz not null default now(),
  committed_at   timestamptz
);

create index import_batches_city_id_idx on import_batches (city_id);
create index import_batches_created_at_idx on import_batches (created_at desc);

alter table holdings
  add constraint holdings_import_batch_id_fkey
  foreign key (import_batch_id) references import_batches(id) on delete set null;

create table quality_snapshots (
  id                  uuid primary key default gen_random_uuid(),
  city_id             uuid not null references cities(id) on delete cascade,
  captured_at         timestamptz not null default now(),
  overall_score       numeric(5, 2) not null,
  field_completeness  jsonb not null,
  issue_counts        jsonb not null
);

create index quality_snapshots_city_id_idx on quality_snapshots (city_id);
create index quality_snapshots_captured_at_idx on quality_snapshots (captured_at desc);

-- Storage bucket for original uploaded workbooks (kept indefinitely per DASHBOARD_PLAN.md § 11).
insert into storage.buckets (id, name, public)
values ('imports', 'imports', false)
on conflict (id) do nothing;
