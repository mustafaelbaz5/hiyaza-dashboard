import type { Result } from "@/lib/result";
import type { AppError } from "@/lib/errors";
import type { MergedHolding } from "./core/merge-holding";
import type { EditableField } from "./core/editable-fields";

export interface HoldingsListFilters {
  search?: string;
  basinName?: string;
}

export interface HoldingsListParams {
  cityId: string;
  filters?: HoldingsListFilters;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  pageIndex: number;
  pageSize: number;
}

export interface HoldingsListResult {
  rows: MergedHolding[];
  totalCount: number;
}

export interface ApplyEditInput {
  holdingId: string;
  cityId: string;
  field: EditableField;
  newValue: string | number | null;
}

export interface BulkApplyFieldInput {
  cityId: string;
  holdingIds: string[];
  field: EditableField;
  newValue: string | number | null;
}

export interface HoldingsRepository {
  list(params: HoldingsListParams): Promise<Result<HoldingsListResult, AppError>>;
  getById(holdingId: string): Promise<Result<MergedHolding | null, AppError>>;
  applyEdit(input: ApplyEditInput): Promise<Result<void, AppError>>;
  bulkApplyField(input: BulkApplyFieldInput): Promise<Result<number, AppError>>;
  listBasins(cityId: string): Promise<Result<string[], AppError>>;
  listAllForExport(cityId: string, filters?: HoldingsListFilters): Promise<Result<MergedHolding[], AppError>>;
}
