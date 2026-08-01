-- Large imports (2900+ rows) were hitting Postgres's default statement_timeout (~8s on the
-- hosted plan) because commit_import_batch inserts one row at a time with per-row error
-- isolation (20260801000013). The whole transaction rolled back, so nothing was saved and the
-- dashboard showed a generic "فشل حفظ الاستيراد" with no indication it was a timeout.
--
-- Raises the statement timeout for just this function's execution (via `set` in the function
-- signature, scoped to calls of this function only, restored automatically on return) rather
-- than the database-wide default, since the row-by-row loop is the only place slow enough to
-- need it.

alter function commit_import_batch(uuid, text, text, int, int, jsonb, jsonb)
  set statement_timeout = '120s';
