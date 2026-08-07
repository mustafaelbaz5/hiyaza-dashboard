import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { ok, err } from "@/lib/result";
import { fromSupabaseError } from "@/lib/errors";
import type {
  AssociationTypeOption,
  AssociationTypesRepository,
  CreateAssociationTypeInput,
  UpdateAssociationTypeInput,
} from "../types";

type AssociationTypeRow = Database["public"]["Tables"]["association_types"]["Row"];

function toAssociationType(row: AssociationTypeRow): AssociationTypeOption {
  return {
    code: row.code,
    labelAr: row.label_ar,
    labelEn: row.label_en,
    sortOrder: row.sort_order,
  };
}

/** association_types reference-table repository — the registry backing cities.association_type_code. */
export function createSupabaseAssociationTypesRepository(
  supabase: SupabaseClient<Database>,
): AssociationTypesRepository {
  return {
    async list() {
      const { data, error } = await supabase
        .from("association_types")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) return err(fromSupabaseError(error));
      return ok(data.map(toAssociationType));
    },

    async create(input: CreateAssociationTypeInput) {
      const { data, error } = await supabase
        .from("association_types")
        .insert({
          code: input.code,
          label_ar: input.labelAr,
          label_en: input.labelEn ?? null,
          sort_order: input.sortOrder ?? 0,
        })
        .select("*")
        .single();

      if (error) return err(fromSupabaseError(error));
      return ok(toAssociationType(data));
    },

    async update(code: string, input: UpdateAssociationTypeInput) {
      const { data, error } = await supabase
        .from("association_types")
        .update({
          ...(input.labelAr !== undefined && { label_ar: input.labelAr }),
          ...(input.labelEn !== undefined && { label_en: input.labelEn }),
          ...(input.sortOrder !== undefined && { sort_order: input.sortOrder }),
        })
        .eq("code", code)
        .select("*")
        .single();

      if (error) return err(fromSupabaseError(error));
      return ok(toAssociationType(data));
    },

    async delete(code: string) {
      const { error } = await supabase.from("association_types").delete().eq("code", code);
      if (error) return err(fromSupabaseError(error));
      return ok(undefined);
    },
  };
}
