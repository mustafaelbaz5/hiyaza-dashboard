import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { ok, err } from "@/lib/result";
import { fromSupabaseError } from "@/lib/errors";
import { TABLES } from "@/lib/constants";
import type { AddedHolding, ApproveInput, RejectInput, ReviewListParams, ReviewRepository } from "../types";

type AddedHoldingRow = Database["public"]["Tables"]["added_holdings"]["Row"];

function toAddedHolding(row: AddedHoldingRow): AddedHolding {
  return {
    id: row.id,
    cityId: row.city_id,
    holdingIdNumber: row.holding_id_number,
    unifiedNumber: row.unified_number,
    holderName: row.holder_name,
    ownerName: row.owner_name,
    nationalId: row.national_id,
    basinName: row.basin_name,
    landNumber: row.land_number,
    feddan: row.feddan,
    qirat: row.qirat,
    sahm: row.sahm,
    notes: row.notes,
    status: row.status,
    rejectionReason: row.rejection_reason,
    createdBy: row.created_by,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    promotedHoldingId: row.promoted_holding_id,
    createdAt: row.created_at,
  };
}

/** Review-queue repository — approve/reject delegate to Postgres RPCs for atomic promotion. */
export function createSupabaseReviewRepository(
  supabase: SupabaseClient<Database>,
): ReviewRepository {
  return {
    async list(params: ReviewListParams) {
      let query = supabase.from(TABLES.addedHoldings).select("*").order("created_at", { ascending: false });
      if (params.cityId) query = query.eq("city_id", params.cityId);
      if (params.status) query = query.eq("status", params.status);

      const { data, error } = await query;
      if (error) return err(fromSupabaseError(error));
      return ok(data.map(toAddedHolding));
    },

    async approve(input: ApproveInput) {
      const { error } = await supabase.rpc("approve_added_holding", {
        p_added_holding_id: input.addedHoldingId,
        p_holding_id_number: input.holdingIdNumber ?? "",
      });
      if (error) return err(fromSupabaseError(error));
      return ok(undefined);
    },

    async reject(input: RejectInput) {
      const { error } = await supabase.rpc("reject_added_holding", {
        p_added_holding_id: input.addedHoldingId,
        p_reason: input.reason,
      });
      if (error) return err(fromSupabaseError(error));
      return ok(undefined);
    },

    async updateFields(id: string, fields: Partial<AddedHolding>) {
      const { error } = await supabase
        .from(TABLES.addedHoldings)
        .update({
          ...(fields.holderName !== undefined && { holder_name: fields.holderName }),
          ...(fields.nationalId !== undefined && { national_id: fields.nationalId }),
          ...(fields.basinName !== undefined && { basin_name: fields.basinName }),
          ...(fields.landNumber !== undefined && { land_number: fields.landNumber }),
          ...(fields.feddan !== undefined && { feddan: fields.feddan }),
          ...(fields.qirat !== undefined && { qirat: fields.qirat }),
          ...(fields.sahm !== undefined && { sahm: fields.sahm }),
        })
        .eq("id", id);
      if (error) return err(fromSupabaseError(error));
      return ok(undefined);
    },
  };
}
