import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { CityStatus } from "../types";
import { ok, err } from "@/lib/result";
import { fromSupabaseError } from "@/lib/errors";
import { TABLES } from "@/lib/constants";
import type { City, CityRepository, CityWithStats, CreateCityInput, UpdateCityInput } from "../types";

type CityRow = Database["public"]["Tables"]["cities"]["Row"];

function toCity(row: CityRow): City {
  return {
    id: row.id,
    name: row.name,
    administration: row.administration,
    directorate: row.directorate,
    status: row.status,
    dataVersion: row.data_version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Cities repository backed by a real Supabase client — injected, never constructed by callers. */
export function createSupabaseCitiesRepository(
  supabase: SupabaseClient<Database>,
): CityRepository {
  return {
    async list() {
      const { data, error } = await supabase
        .from(TABLES.cities)
        .select("*, holdings(count), import_batches(committed_at)")
        .order("created_at", { ascending: false });

      if (error) return err(fromSupabaseError(error));

      const cities: CityWithStats[] = (data ?? []).map((row) => {
        const holdingsRelation = row.holdings as unknown as { count: number }[] | null;
        const importsRelation = row.import_batches as unknown as { committed_at: string | null }[] | null;
        const committedDates = (importsRelation ?? [])
          .map((b) => b.committed_at)
          .filter((d): d is string => Boolean(d))
          .sort()
          .reverse();

        return {
          ...toCity(row),
          holdingsCount: holdingsRelation?.[0]?.count ?? 0,
          lastImportAt: committedDates[0] ?? null,
        };
      });

      return ok(cities);
    },

    async getById(cityId) {
      const { data, error } = await supabase
        .from(TABLES.cities)
        .select("*")
        .eq("id", cityId)
        .maybeSingle();

      if (error) return err(fromSupabaseError(error));
      return ok(data ? toCity(data) : null);
    },

    async create(input: CreateCityInput) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from(TABLES.cities)
        .insert({
          name: input.name,
          administration: input.administration ?? null,
          directorate: input.directorate ?? null,
          created_by: user?.id,
        })
        .select("*")
        .single();

      if (error) return err(fromSupabaseError(error));
      return ok(toCity(data));
    },

    async update(cityId: string, input: UpdateCityInput) {
      const { data, error } = await supabase
        .from(TABLES.cities)
        .update({
          ...(input.name !== undefined && { name: input.name }),
          ...(input.administration !== undefined && { administration: input.administration }),
          ...(input.directorate !== undefined && { directorate: input.directorate }),
        })
        .eq("id", cityId)
        .select("*")
        .single();

      if (error) return err(fromSupabaseError(error));
      return ok(toCity(data));
    },

    async setStatus(cityId: string, status: CityStatus) {
      const { data, error } = await supabase
        .from(TABLES.cities)
        .update({ status })
        .eq("id", cityId)
        .select("*")
        .single();

      if (error) return err(fromSupabaseError(error));
      return ok(toCity(data));
    },
  };
}
