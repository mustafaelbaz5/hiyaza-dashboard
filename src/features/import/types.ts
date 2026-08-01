import type { Result } from "@/lib/result";
import type { AppError } from "@/lib/errors";
import type { PreviewSummary } from "./core/preview-summary";
import type { HoldingInsertRecord } from "./core/build-holding-records";

export interface ImportBatchSummary {
  id: string;
  cityId: string;
  fileName: string;
  status: string;
  rowsTotal: number;
  rowsImported: number;
  rowsRejected: number;
  importedBy: string;
  createdAt: string;
  committedAt: string | null;
}

export interface CommitImportInput {
  cityId: string;
  fileName: string;
  storagePath: string | null;
  preview: PreviewSummary;
  records: HoldingInsertRecord[];
  mappingUsed: Record<string, string>;
}

export interface ImportRepository {
  getExistingUnifiedNumbers(cityId: string): Promise<Result<Set<string>, AppError>>;
  listBatches(cityId: string): Promise<Result<ImportBatchSummary[], AppError>>;
  commitImport(input: CommitImportInput): Promise<Result<ImportBatchSummary, AppError>>;
  rollbackBatch(batchId: string): Promise<Result<void, AppError>>;
}
