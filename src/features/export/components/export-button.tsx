"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useExportUnifiedHoldings } from "../hooks/use-export-unified-holdings";
import type { ExportFilters } from "../types";

interface ExportButtonProps {
  filters?: ExportFilters;
  label?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
}

export function ExportButton({
  filters = {},
  label = "تصدير إلى Excel",
  variant = "default",
  size = "default",
}: ExportButtonProps) {
  const [showError, setShowError] = useState<string | null>(null);
  const { mutate, isPending } = useExportUnifiedHoldings();

  const handleExport = () => {
    setShowError(null);
    mutate(filters, {
      onError: (error) => {
        const message = error instanceof Error ? error.message : "Failed to export";
        setShowError(message);
      },
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleExport}
        disabled={isPending}
        variant={variant}
        size={size}
        className="gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            جاري التصدير...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            {label}
          </>
        )}
      </Button>
      {showError && (
        <p className="text-sm text-red-600">
          خطأ: {showError}
        </p>
      )}
    </div>
  );
}
