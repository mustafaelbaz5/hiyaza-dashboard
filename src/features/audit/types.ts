import type { Result } from "@/lib/result";
import type { AppError } from "@/lib/errors";

export type AuditEntityType = "import" | "holding_edit" | "added_holding" | "city_management" | "user_management";

export interface AuditEntry {
  entityType: AuditEntityType;
  entityId: string;
  cityId: string;
  userId: string | null;
  occurredAt: string;
  details: Record<string, unknown>;
}

export interface AuditEntryWithUser extends AuditEntry {
  userDisplayName: string | null;
  userEmail: string | null;
}

export interface AuditFilters {
  cityId?: string;
  userId?: string;
  entityType?: AuditEntityType;
  dateFrom?: string;
  dateTo?: string;
}

export interface HoldingEditDiff {
  field: string;
  before: unknown;
  after: unknown;
}

export interface HoldingEditHistoryEntry {
  editId: string;
  editedAt: string;
  editedBy: string | null;
  editedByDisplayName: string | null;
  editedByEmail: string | null;
}

export interface AuditRepository {
  listFeed(filters: AuditFilters): Promise<Result<AuditEntryWithUser[], AppError>>;
  getHoldingEditDiff(holdingId: string, editId: string): Promise<Result<HoldingEditDiff[], AppError>>;
  listHoldingEditHistory(holdingId: string): Promise<Result<HoldingEditHistoryEntry[], AppError>>;
}
