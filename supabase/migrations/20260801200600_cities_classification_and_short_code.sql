-- Two more city-level fields needed for the Excel export, confirmed via the field-population
-- walkthrough — both distinct from association_type/association_subtype (20260801200000):
--
-- classification: a separate, third classification concept for export column 6 (تصنيف الجمعيات
-- الزراعية). The real Excel template's dropdown for this column lists استصلاح/ائتمان/اصلاح,
-- which does not overlap association_type's values (agricultural_credit/agricultural_reform) or
-- association_subtype's (ملك/اوقاف/إصلاح مُملك/إصلاح اشتراكي/إصلاح قانون ثلاثة) — confirmed not
-- an alias of either.
--
-- short_code: association short-code for export column 3 (كود الجمعية الزراعية). cities only had
-- a UUID id before this; admin fills this in manually per city, no uniqueness constraint for now.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'city_classification') then
    create type city_classification as enum ('استصلاح', 'ائتمان', 'اصلاح');
  end if;
end $$;

alter table cities
  add column if not exists classification city_classification,
  add column if not exists short_code text;

comment on column cities.classification is
  'Third association classification, separate from association_type/association_subtype. Maps to export column "تصنيف الجمعيات الزراعية".';
comment on column cities.short_code is
  'Admin-entered association short code. Maps to export column "كود الجمعية الزراعية". No uniqueness constraint.';
