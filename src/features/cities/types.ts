import type { Result } from "@/lib/result";
import type { AppError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

export type CityStatus = Database["public"]["Enums"]["city_status"];
export type AssociationType = Database["public"]["Enums"]["association_type"];

export interface City {
  id: string;
  name: string;
  administration: string | null;
  directorate: string | null;
  status: CityStatus;
  associationType: AssociationType | null;
  associationTypeCode: string | null;
  associationSubtype: string | null;
  dataVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface CityWithStats extends City {
  holdingsCount: number;
  lastImportAt: string | null;
}

export interface CreateCityInput {
  name: string;
  administration?: string;
  directorate?: string;
  associationType?: AssociationType | null;
  associationTypeCode?: string | null;
  associationSubtype?: string | null;
}

export interface UpdateCityInput {
  name?: string;
  administration?: string;
  directorate?: string;
  associationType?: AssociationType | null;
  associationTypeCode?: string | null;
  associationSubtype?: string | null;
}

export interface CityRepository {
  list(): Promise<Result<CityWithStats[], AppError>>;
  getById(cityId: string): Promise<Result<City | null, AppError>>;
  create(input: CreateCityInput): Promise<Result<City, AppError>>;
  update(cityId: string, input: UpdateCityInput): Promise<Result<City, AppError>>;
  setStatus(cityId: string, status: CityStatus): Promise<Result<City, AppError>>;
  /** Safe delete — the database refuses this if the city has any holdings or import history. */
  delete(cityId: string): Promise<Result<void, AppError>>;
  /** Admin-only, irreversible: permanently deletes the city and all its holdings/edits/imports. */
  deleteCascade(cityId: string): Promise<Result<void, AppError>>;
}
