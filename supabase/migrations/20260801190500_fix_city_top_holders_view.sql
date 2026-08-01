-- The live city_top_holders view had drifted from this repo's migrations (20260801000004) via an
-- undocumented direct change: it gained city_name/holding_id_number/last_updated but lost
-- total_feddan, which the dashboard's city drilldown board requires (city-drilldown-board.tsx
-- sorts and displays top holders by total_feddan). That mismatch made every request for this view
-- fail with "column city_top_holders.total_feddan does not exist" (PostgREST 400).
--
-- Recreates the view with total_feddan restored, keeping is_stale filtering consistent with every
-- other analytics view in this file.

drop materialized view if exists city_top_holders;
drop view if exists city_top_holders;

create view city_top_holders as
select
  city_id,
  holder_name,
  national_id,
  count(*) as holdings_count,
  coalesce(sum(feddan), 0) as total_feddan
from holdings
where is_stale = false and holder_name is not null
group by city_id, holder_name, national_id;
