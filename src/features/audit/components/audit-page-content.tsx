"use client";

import { useState } from "react";
import { AuditFiltersBar } from "./audit-filters-bar";
import { AuditFeed } from "./audit-feed";
import type { AuditEntityType } from "../types";

/** Client container for the audit page — owns filter state, composes filters bar + feed. */
export function AuditPageContent() {
  const [entityType, setEntityType] = useState<AuditEntityType | "all">("all");

  return (
    <div className="space-y-4">
      <AuditFiltersBar entityType={entityType} onEntityTypeChange={setEntityType} />
      <AuditFeed filters={entityType === "all" ? {} : { entityType }} />
    </div>
  );
}
