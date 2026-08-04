-- This migration originally rewrote unified_holdings_export to select raw holdings/added_holdings
-- columns plus an untouched latest_edit_payload JSON blob, to fix a missing added_holdings.
-- usage_type fallback. That rewrite was itself a regression — every downstream consumer expected
-- fully-merged fields, not a raw payload nobody read — and was reverted one migration later
-- (20260801201000_restore_unified_export_merged_edits.sql), which also fixes the same usage_type
-- gap via holdings_with_merged_edits/added_holdings_with_merged_edits' existing coalesce logic.
--
-- Left as a no-op (rather than deleted) to preserve migration history/ordering. Also: at the time
-- this repair was made, holdings.crop_type/notes/etc. did not yet exist as real columns on the
-- live database (see 20260801200625/200630), which is what made this migration's original `h.*`
-- + explicit `ah.crop_type` selection fail with "column crop_type specified more than once" once
-- those columns were finally added — another symptom of the same original design regression.

select 1;
