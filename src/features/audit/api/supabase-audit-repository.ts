import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { ok, err } from "@/lib/result";
import { fromSupabaseError } from "@/lib/errors";
import { EDITABLE_FIELDS } from "@/features/holdings/core/editable-fields";
import { normalizeEditPayload } from "@/features/holdings/core/merge-holding";
import type {
  AuditEntry,
  AuditEntryWithUser,
  AuditFilters,
  AuditRepository,
  HoldingEditDiff,
  HoldingEditHistoryEntry,
} from "../types";

const FEED_LIMIT = 200;

/** Audit repository — reads the audit_feed view (DASHBOARD_PLAN.md § 6.6) and joins reviewer/editor names. */
export function createSupabaseAuditRepository(
  supabase: SupabaseClient<Database>,
): AuditRepository {
  return {
    async listFeed(filters: AuditFilters) {
      let query = supabase
        .from("audit_feed")
        .select("*")
        .order("occurred_at", { ascending: false })
        .limit(FEED_LIMIT);

      if (filters.cityId) query = query.eq("city_id", filters.cityId);
      if (filters.userId) query = query.eq("user_id", filters.userId);
      if (filters.entityType) query = query.eq("entity_type", filters.entityType);
      if (filters.dateFrom) query = query.gte("occurred_at", filters.dateFrom);
      if (filters.dateTo) query = query.lte("occurred_at", filters.dateTo);

      const { data, error } = await query;
      if (error) return err(fromSupabaseError(error));

      const entries: AuditEntry[] = (data ?? []).map((row) => ({
        entityType: row.entity_type as AuditEntry["entityType"],
        entityId: row.entity_id as string,
        cityId: row.city_id as string,
        userId: row.user_id as string | null,
        occurredAt: row.occurred_at as string,
        details: (row.details ?? {}) as Record<string, unknown>,
      }));

      const userIds = [...new Set(entries.map((e) => e.userId).filter((id): id is string => Boolean(id)))];
      const { data: profiles } = userIds.length
        ? await supabase.from("profiles").select("id, display_name, email").in("id", userIds)
        : { data: [] };
      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

      const withUsers: AuditEntryWithUser[] = entries.map((e) => ({
        ...e,
        userDisplayName: (e.userId && profileMap.get(e.userId)?.display_name) || null,
        userEmail: (e.userId && profileMap.get(e.userId)?.email) || null,
      }));

      return ok(withUsers);
    },

    async getHoldingEditDiff(holdingId: string, editId: string) {
      const { data: allEdits, error: editsError } = await supabase
        .from("holding_edits")
        .select("id, payload, edited_at")
        .eq("holding_id", holdingId)
        .order("edited_at", { ascending: true });
      if (editsError) return err(fromSupabaseError(editsError));

      const { data: base, error: baseError } = await supabase
        .from("holdings")
        .select("*")
        .eq("id", holdingId)
        .single();
      if (baseError) return err(fromSupabaseError(baseError));

      const targetIndex = (allEdits ?? []).findIndex((e) => e.id === editId);
      if (targetIndex === -1) return err({ code: "not_found", message: "لم يتم العثور على التعديل" });

      const target = allEdits![targetIndex]!;
      const previous = targetIndex > 0 ? allEdits![targetIndex - 1] : null;

      const targetPayload =
        normalizeEditPayload(target.payload as Record<string, unknown>) ?? {};
      const previousPayload = previous
        ? (normalizeEditPayload(previous.payload as Record<string, unknown>) ?? {})
        : (base as unknown as Record<string, unknown>);

      const diffs: HoldingEditDiff[] = [];
      for (const field of EDITABLE_FIELDS) {
        const before = previousPayload[field] ?? null;
        const after = targetPayload[field] ?? null;
        if (before !== after) {
          diffs.push({ field, before, after });
        }
      }

      return ok(diffs);
    },

    async listHoldingEditHistory(holdingId: string) {
      const { data: edits, error: editsError } = await supabase
        .from("holding_edits")
        .select("id, edited_at, edited_by")
        .eq("holding_id", holdingId)
        .order("edited_at", { ascending: false });
      if (editsError) return err(fromSupabaseError(editsError));

      const userIds = [...new Set((edits ?? []).map((e) => e.edited_by).filter((id): id is string => Boolean(id)))];
      const { data: profiles } = userIds.length
        ? await supabase.from("profiles").select("id, display_name, email").in("id", userIds)
        : { data: [] };
      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

      const history: HoldingEditHistoryEntry[] = (edits ?? []).map((e) => ({
        editId: e.id,
        editedAt: e.edited_at,
        editedBy: e.edited_by,
        editedByDisplayName: (e.edited_by && profileMap.get(e.edited_by)?.display_name) || null,
        editedByEmail: (e.edited_by && profileMap.get(e.edited_by)?.email) || null,
      }));

      return ok(history);
    },
  };
}
