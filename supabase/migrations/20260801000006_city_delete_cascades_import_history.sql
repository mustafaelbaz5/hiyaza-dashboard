-- Fixes a real usability bug found testing city delete: import_batches.city_id used
-- `on delete restrict`, so a city with ZERO holdings but a leftover import_batches row (e.g. a
-- rolled-back or superseded import) could never be permanently deleted, even though it has no
-- real data at risk. DASHBOARD_PLAN.md § 6.2's rule ("deleting a city with holdings must be
-- impossible") protects holdings specifically — import_batches is dashboard-only audit history
-- that's meaningless once its city is gone. holdings.city_id keeps `on delete restrict`
-- unchanged, so a city with actual data is still fully protected.

alter table import_batches drop constraint import_batches_city_id_fkey;
alter table import_batches
  add constraint import_batches_city_id_fkey
  foreign key (city_id) references cities(id) on delete cascade;
