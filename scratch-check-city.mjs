import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(new URL("./.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Find the city
const { data: cities, error: cityErr } = await supabase
  .from("cities")
  .select("id, name, association_type")
  .ilike("name", "%الدير%");
console.log("Matching cities:", cities, cityErr);

if (cities && cities.length > 0) {
  for (const city of cities) {
    console.log(`\n--- City: ${city.name} (${city.id}) ---`);

    const { count: total } = await supabase
      .from("unified_holdings_export")
      .select("*", { count: "exact", head: true })
      .eq("city_id", city.id);
    console.log("Total rows in unified_holdings_export for this city:", total);

    const { count: cropCount } = await supabase
      .from("unified_holdings_export")
      .select("*", { count: "exact", head: true })
      .eq("city_id", city.id)
      .not("crop_type", "is", null)
      .neq("crop_type", "");
    console.log("Rows with non-empty crop_type:", cropCount);

    const { data: sample } = await supabase
      .from("unified_holdings_export")
      .select("id, holding_id_number, crop_type")
      .eq("city_id", city.id)
      .limit(5);
    console.log("Sample rows:", sample);

    // Check raw holdings table directly (bypass the view)
    const { count: rawHoldingsCrop } = await supabase
      .from("holdings")
      .select("*", { count: "exact", head: true })
      .eq("city_id", city.id)
      .not("crop_type", "is", null)
      .neq("crop_type", "");
    console.log("Raw holdings.crop_type non-empty count:", rawHoldingsCrop);

    const { count: rawAddedCrop } = await supabase
      .from("added_holdings")
      .select("*", { count: "exact", head: true })
      .eq("city_id", city.id)
      .not("crop_type", "is", null)
      .neq("crop_type", "");
    console.log("Raw added_holdings.crop_type non-empty count:", rawAddedCrop);
  }
}
