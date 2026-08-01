import type { Result } from "@/lib/result";
import type { AppError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

export type ReviewStatus = Database["public"]["Enums"]["record_status"];

export interface AddedHolding {
  id: string;
  cityId: string;
  holdingIdNumber: string | null;
  unifiedNumber: string | null;
  holderName: string;
  ownerName: string | null;
  nationalId: string | null;
  basinName: string | null;
  landNumber: string | null;
  feddan: number;
  qirat: number;
  sahm: number;
  notes: string | null;
  status: ReviewStatus;
  rejectionReason: string | null;
  createdBy: string;
  createdByName: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  promotedHoldingId: string | null;
  createdAt: string;
}

export interface ReviewListParams {
  cityId?: string;
  status?: ReviewStatus;
}

export interface ApproveInput {
  addedHoldingId: string;
  holdingIdNumber: string | null;
}

export interface RejectInput {
  addedHoldingId: string;
  reason: string;
}

export interface ReviewRepository {
  list(params: ReviewListParams): Promise<Result<AddedHolding[], AppError>>;
  approve(input: ApproveInput): Promise<Result<void, AppError>>;
  reject(input: RejectInput): Promise<Result<void, AppError>>;
  updateFields(id: string, fields: Partial<AddedHolding>): Promise<Result<void, AppError>>;
}
