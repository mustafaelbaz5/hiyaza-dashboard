"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadAuditCSV } from "../core/audit-csv-writer";
import type { AuditEntryWithUser } from "../types";

interface AuditExportButtonProps {
  entries: AuditEntryWithUser[];
  disabled?: boolean;
}

export function AuditExportButton({ entries, disabled }: AuditExportButtonProps) {
  const handleExport = () => {
    if (entries.length === 0) {
      alert("لا توجد بيانات للتصدير");
      return;
    }
    downloadAuditCSV(entries);
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled || entries.length === 0}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      تصدير إلى CSV
    </Button>
  );
}
