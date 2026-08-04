-- The live `holdings` table is missing 8 columns that holdings_with_merged_edits
-- (20260801200650) and the export pipeline require: crop_type, notes, credit_type, usage_type,
-- is_delegate, is_inheritance, owner_name, reform_type. These have always existed on
-- added_holdings (field-added parcels) but were never added to holdings (imported/promoted
-- parcels) — likely because promoted holdings only ever needed geo/name/area fields until the
-- export work required the full field set. Without these columns, holdings_with_merged_edits
-- cannot even be created, which is why notes/crop_type/etc. have never actually worked for
-- imported holdings, only for field-added ones.
--
-- Types/defaults mirror added_holdings exactly, except reform_type — which doesn't exist on
-- either table today (referenced by the view/edit-payload code but never actually backed by a
-- column anywhere) — added here as nullable text on both tables for symmetry.

alter table holdings
  add column crop_type text,
  add column notes text,
  add column credit_type text not null default '',
  add column usage_type text not null default '',
  add column is_delegate boolean not null default false,
  add column is_inheritance boolean not null default false,
  add column owner_name text,
  add column reform_type text;

alter table added_holdings
  add column reform_type text;

comment on column holdings.crop_type is 'Crop type, editable via holding_edits — mirrors added_holdings.crop_type.';
comment on column holdings.notes is 'Field team notes, editable via holding_edits — mirrors added_holdings.notes.';
comment on column holdings.credit_type is 'Credit type, editable via holding_edits — mirrors added_holdings.credit_type.';
comment on column holdings.usage_type is 'Usage type, editable via holding_edits — mirrors added_holdings.usage_type.';
comment on column holdings.is_delegate is 'Delegate flag, editable via holding_edits — mirrors added_holdings.is_delegate.';
comment on column holdings.is_inheritance is 'Inheritance flag, editable via holding_edits — mirrors added_holdings.is_inheritance.';
comment on column holdings.owner_name is 'Owner name (if distinct from holder), editable via holding_edits — mirrors added_holdings.owner_name.';
comment on column holdings.reform_type is 'Reform type — referenced by holding_edits payload and the export pipeline but never backed by a column until now; nullable, unpopulated until a source writes to it.';
comment on column added_holdings.reform_type is 'Reform type — referenced by holding_edits payload and the export pipeline but never backed by a column until now; nullable, unpopulated until a source writes to it.';
