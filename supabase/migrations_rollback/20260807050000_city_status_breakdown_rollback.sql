-- Rollback for 20260807050000_city_status_breakdown.sql. Safe at any time — drops the function
-- only, no data was written to add it.

drop function if exists public.city_status_breakdown(uuid);
