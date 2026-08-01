-- Corrects the previous migration that attempted to drop a constraint
-- when it should have dropped the unique index.

drop index if exists holdings_city_dedup_key_unique;
