-- Core schema shared with the Flutter app (HiyazaFinder).
-- Reconstructed from DASHBOARD_PLAN.md's field references plus the real sample workbook
-- الدير_ائتمان_مجمع.xlsx (the canonical source, APP_PLAN.md, lives in the mobile app repo and
-- was not available when this migration was authored). Column set below is the verified
-- 20-column "جميع البيانات" sheet layout, header row 3 (0-indexed row 2):
--   رقم الحيازة | اسم الحائز | الرقم القومي | رقم الارض | فدان | قيراط | سهم | المساحه بالمتر
--   | الشرقى | الغربى | القبلى | البحرى | رقم الصفحة | كود الحوض | اسم الحوض | الجمعيه
--   | الأداره | المديريه | عدد القطع بالحيازة | الرقم الموحد للحيازة

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type app_role as enum ('admin', 'editor', 'viewer', 'field');
create type city_status as enum ('draft', 'published', 'archived');
create type review_status as enum ('pending', 'approved', 'rejected');

-- ---------------------------------------------------------------------------
-- profiles — one row per authenticated user, mirrors auth.users
-- ---------------------------------------------------------------------------

create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text,
  role         app_role not null default 'field',
  is_disabled  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table profiles is 'One row per auth.users entry; role/disabled state gate dashboard access.';

-- ---------------------------------------------------------------------------
-- cities — the جمعية (association) scope everything else hangs off
-- ---------------------------------------------------------------------------

create table cities (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  governorate       text,   -- المديريه
  directorate       text,   -- الأداره
  status            city_status not null default 'draft',
  association_name  text,   -- الجمعيه
  created_by        uuid references profiles(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  archived_at       timestamptz
);

create unique index cities_name_key on cities (name);

-- ---------------------------------------------------------------------------
-- holdings — authoritative land-holding records, one row per حيازة/قطعة
-- ---------------------------------------------------------------------------

create table holdings (
  id                  uuid primary key default gen_random_uuid(),
  city_id             uuid not null references cities(id) on delete restrict,

  -- identifiers
  holding_id_number   text,          -- رقم الحيازة (official; null for app-added people)
  unified_number      text,          -- الرقم الموحد للحيازة — stable official id
  land_number         text,          -- رقم الارض — coerced to text (source is numeric)
  page_number         text,          -- رقم الصفحة
  basin_code          text,          -- كود الحوض
  basin_name          text,          -- اسم الحوض

  -- holder
  holder_name         text,          -- اسم الحائز
  national_id         text,          -- الرقم القومي

  -- area
  area_feddan         numeric(12, 4) default 0,   -- فدان
  area_qirat          numeric(12, 4) default 0,   -- قيراط
  area_sahm           numeric(12, 4) default 0,   -- سهم
  area_sqm            numeric(14, 4) default 0,   -- المساحه بالمتر

  -- borders (حدود القطعة)
  border_east         text,   -- الشرقى
  border_west         text,   -- الغربى
  border_south        text,   -- القبلى
  border_north        text,   -- البحرى

  -- association / metadata carried per-row in the source file
  association_name    text,   -- الجمعيه
  directorate          text,  -- الأداره
  governorate          text,  -- المديريه

  -- provenance
  import_batch_id     uuid,          -- fk added once import_batches exists (dashboard-only table)
  is_stale            boolean not null default false,
  source_row_number   int,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index holdings_city_id_idx on holdings (city_id);
create unique index holdings_city_unified_number_key
  on holdings (city_id, unified_number)
  where unified_number is not null;
create index holdings_national_id_idx on holdings (national_id);
create index holdings_basin_code_idx on holdings (basin_code);

-- ---------------------------------------------------------------------------
-- holding_edits — overlay/correction records; holdings rows are never mutated directly
-- ---------------------------------------------------------------------------

create table holding_edits (
  id            uuid primary key default gen_random_uuid(),
  holding_id    uuid not null references holdings(id) on delete cascade,
  field_name    text not null,
  old_value     text,
  new_value     text,
  edited_by     uuid not null references profiles(id),
  created_at    timestamptz not null default now()
);

create index holding_edits_holding_id_idx on holding_edits (holding_id);
create index holding_edits_created_at_idx on holding_edits (created_at desc);

-- ---------------------------------------------------------------------------
-- added_holdings — records created in the field by the mobile app, pending review
-- ---------------------------------------------------------------------------

create table added_holdings (
  id                  uuid primary key default gen_random_uuid(),
  city_id             uuid not null references cities(id) on delete restrict,

  holder_name         text not null,
  national_id         text,
  basin_code          text,
  basin_name          text,
  land_number         text,
  page_number         text,
  area_feddan         numeric(12, 4) default 0,
  area_qirat          numeric(12, 4) default 0,
  area_sahm           numeric(12, 4) default 0,
  notes                text,

  status              review_status not null default 'pending',
  created_by          uuid not null references profiles(id),
  reviewed_by         uuid references profiles(id),
  reviewed_at         timestamptz,
  rejection_reason    text,
  promoted_holding_id uuid references holdings(id),

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index added_holdings_city_id_idx on added_holdings (city_id);
create index added_holdings_status_idx on added_holdings (status);

-- ---------------------------------------------------------------------------
-- updated_at maintenance trigger, reused by every mutable table
-- ---------------------------------------------------------------------------

create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger cities_set_updated_at before update on cities
  for each row execute function set_updated_at();
create trigger holdings_set_updated_at before update on holdings
  for each row execute function set_updated_at();
create trigger added_holdings_set_updated_at before update on added_holdings
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- New auth.users -> profiles bridge
-- ---------------------------------------------------------------------------

create function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
