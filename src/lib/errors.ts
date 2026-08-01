/** Closed taxonomy of failures so callers can switch on `code` instead of parsing messages. */
export type AppError =
  | { code: "unauthorized"; message: string }
  | { code: "forbidden"; message: string }
  | { code: "not_found"; message: string }
  | { code: "validation"; message: string; fieldErrors?: Record<string, string[]> }
  | { code: "conflict"; message: string }
  | { code: "database"; message: string; cause?: unknown }
  | { code: "network"; message: string; cause?: unknown }
  | { code: "unknown"; message: string; cause?: unknown };

/** Central place to turn a Supabase/Postgrest error into a typed AppError. */
export function fromSupabaseError(error: { message: string; code?: string }): AppError {
  if (error.code === "PGRST116") {
    return { code: "not_found", message: "لم يتم العثور على السجل" };
  }
  if (error.code === "23505") {
    return { code: "conflict", message: "هذا السجل موجود بالفعل" };
  }
  if (error.code === "23503") {
    return {
      code: "conflict",
      message: "لا يمكن الحذف — توجد بيانات مرتبطة بهذا السجل (حيازات أو سجلات استيراد). أرشفه بدلاً من ذلك.",
    };
  }
  return { code: "database", message: error.message, cause: error };
}
