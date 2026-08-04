"use client";

import { useState } from "react";
import { AuditFiltersBar } from "./audit-filters-bar";
import { AuditFeed } from "./audit-feed";
import type { AuditFilters } from "../types";

/** Client container for the audit page — owns filter state, composes filters bar + feed. */
export function AuditPageContent() {
  const [filters, setFilters] = useState<AuditFilters>({});

  return (
    <div className="space-y-4">
      <AuditFiltersBar filters={filters} onFiltersChange={setFilters} />
      <AuditFeed filters={filters} />
    </div>
  );
}
