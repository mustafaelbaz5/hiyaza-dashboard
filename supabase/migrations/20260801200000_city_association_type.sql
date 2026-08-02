-- Adds the association type/subtype classification to cities, per the Egyptian agricultural
-- association model: every association is either الائتمان الزراعي (Agricultural Credit) or
-- الإصلاح الزراعي (Agricultural Reform), each with its own closed set of subtypes:
--   - Agricultural Credit subtypes: ملك | اوقاف
--   - Agricultural Reform subtypes: إصلاح مُملك | إصلاح اشتراكي | إصلاح قانون ثلاثة
-- One text subtype column with a conditional check constraint (not two enum columns), since the
-- valid subtype set depends on the parent type — the check constraint expresses that cross-field
-- dependency directly, and would be needed either way to prevent mismatched pairs.
-- Both columns nullable: legacy cities have no type until an admin sets one (or an import detects
-- it — see the import feature's detectAssociationType, wired in a later migration/PR).

create type association_type as enum ('agricultural_credit', 'agricultural_reform');

alter table cities
  add column association_type association_type,
  add column association_subtype text;

alter table cities add constraint cities_subtype_valid check (
  association_subtype is null
  or (association_type = 'agricultural_credit' and association_subtype in ('ملك', 'اوقاف'))
  or (association_type = 'agricultural_reform' and association_subtype in
      ('إصلاح مُملك', 'إصلاح اشتراكي', 'إصلاح قانون ثلاثة'))
);

comment on column cities.association_type is
  'Top-level association classification: agricultural_credit (الائتمان الزراعي) or agricultural_reform (الإصلاح الزراعي).';
comment on column cities.association_subtype is
  'Subtype within the association_type — credit: ملك|اوقاف; reform: إصلاح مُملك|إصلاح اشتراكي|إصلاح قانون ثلاثة. Enforced by cities_subtype_valid.';
