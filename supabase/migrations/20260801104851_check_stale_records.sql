-- Unhide all previously stale records by marking them as active
UPDATE holdings
SET is_stale = false
WHERE is_stale = true;
