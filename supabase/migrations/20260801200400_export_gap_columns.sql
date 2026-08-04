-- Placeholder columns for 4 Excel export fields with no current schema home: soil type, growth
-- stages, and the two "كارت الفلاح" (farmer-card) name variants. Nullable, blank until a future
-- source populates them — see the Excel mapper's business rules for how each is used (or not yet
-- used, in the farmer-card case, where the export currently duplicates the field-survey names
-- instead of reading these columns).
--
-- Added to both holdings and added_holdings for symmetry with unified_holdings_export's left join
-- of added_holdings onto holdings.

alter table holdings
  add column soil_type text,
  add column growth_stages text,
  add column holder_name_farmer_card text,
  add column owner_name_farmer_card text;

alter table added_holdings
  add column soil_type text,
  add column growth_stages text,
  add column holder_name_farmer_card text,
  add column owner_name_farmer_card text;
