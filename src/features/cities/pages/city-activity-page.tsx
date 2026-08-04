"use client";

import { AuditFiltersBar } from "@/features/audit/components/audit-filters-bar";
import { AuditFeed } from "@/features/audit/components/audit-feed";
import type { AuditFilters } from "@/features/audit/types";
import { useState } from "react";

/** Per-city activity/audit log view. Shows all changes to that city and its holdings.
 *
 * Unlike the global /audit page, this is pre-filtered to one city and excludes
 * user_management rows (which have entity_id as user_id, not city_id).
 */
export function CityActivityPage({ cityId }: { cityId: string }) {
  const [filters, setFilters] = useState<AuditFilters>({ cityId });

  // Create filter handler that preserves cityId
  const handleFiltersChange = (newFilters: AuditFilters) => {
    setFilters({
      ...newFilters,
      cityId, // Always keep city scope
    });
  };

  return (
    <div className="space-y-4">
      <AuditFiltersBar filters={filters} onFiltersChange={handleFiltersChange} />
      {/* Feed automatically excludes user_management rows because they have
          entity_id (user_id) in the city_id column, not an actual city UUID.
          This is a data model quirk (shared city_id column repurposed for different
          entity types) documented in 20260801200300_extend_audit_feed_city_user.sql.

          For now, user_management is global-only. If per-user scoping is needed,
          that requires a separate table/view clarifying the semantic.
      */}
      <AuditFeed filters={filters} />
    </div>
  );
}
