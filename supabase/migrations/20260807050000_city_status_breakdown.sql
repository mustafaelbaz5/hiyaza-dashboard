-- New RPC for a City Overview "status" card: breaks holdings into original/modified/added
-- (the same provenance categories already computed client-side per row by mergeHolding, but
-- aggregated server-side so a City page doesn't need to fetch every holding to count them), plus
-- person-level status counts. Mirrors city_drilldown's pattern (one function, one round trip,
-- no client-side aggregation).
--
-- "original": imported, never edited, never promoted from added_holdings.
-- "modified": has at least one holding_edits row (regardless of provenance — an added holding
--   can also be later edited, and still counts under "added" for the parcel-provenance bucket,
--   but its person is separately counted under persons_with_modified_parcel).
-- "added": promoted from an added_holdings row (added_holdings.promoted_holding_id points at it).
--
-- Live-verified against production (bbahuyqjptojlighriyy) on 2026-08-07: for a sample city,
-- original+modified+added summed to exactly the city's total holdings count, no double counting.

create or replace function public.city_status_breakdown(p_city_id uuid)
returns table(
  total_holdings bigint,
  original_count bigint,
  modified_count bigint,
  added_count bigint,
  total_persons bigint,
  persons_with_added_parcel bigint,
  persons_with_modified_parcel bigint
)
language sql
stable
as $function$
  select
    count(*) as total_holdings,
    count(*) filter (
      where not exists (select 1 from added_holdings ah where ah.promoted_holding_id = h.id)
        and not exists (select 1 from holding_edits he where he.holding_id = h.id and he.holding_type = 'holding')
    ) as original_count,
    count(*) filter (
      where not exists (select 1 from added_holdings ah where ah.promoted_holding_id = h.id)
        and exists (select 1 from holding_edits he where he.holding_id = h.id and he.holding_type = 'holding')
    ) as modified_count,
    count(*) filter (
      where exists (select 1 from added_holdings ah where ah.promoted_holding_id = h.id)
    ) as added_count,
    count(distinct h.person_id) filter (where h.person_id is not null) as total_persons,
    count(distinct h.person_id) filter (
      where h.person_id is not null
        and exists (select 1 from added_holdings ah where ah.promoted_holding_id = h.id)
    ) as persons_with_added_parcel,
    count(distinct h.person_id) filter (
      where h.person_id is not null
        and exists (select 1 from holding_edits he where he.holding_id = h.id and he.holding_type = 'holding')
    ) as persons_with_modified_parcel
  from holdings h
  where h.city_id = p_city_id and h.is_stale = false
$function$;
