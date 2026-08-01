-- Restores all holdings that were previously marked as stale, making them active again.
-- Since we're no longer marking old holdings as stale on new imports, we need to
-- reactivate all the data.

update holdings set is_stale = false where is_stale = true;
