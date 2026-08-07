import type { Result } from "@/lib/result";
import type { AppError } from "@/lib/errors";

export interface AssociationTypeOption {
  code: string;
  labelAr: string;
  labelEn: string | null;
  sortOrder: number;
}

export interface CreateAssociationTypeInput {
  code: string;
  labelAr: string;
  labelEn?: string | null;
  sortOrder?: number;
}

export interface UpdateAssociationTypeInput {
  labelAr?: string;
  labelEn?: string | null;
  sortOrder?: number;
}

export interface AssociationTypesRepository {
  list(): Promise<Result<AssociationTypeOption[], AppError>>;
  create(input: CreateAssociationTypeInput): Promise<Result<AssociationTypeOption, AppError>>;
  update(code: string, input: UpdateAssociationTypeInput): Promise<Result<AssociationTypeOption, AppError>>;
  delete(code: string): Promise<Result<void, AppError>>;
}
