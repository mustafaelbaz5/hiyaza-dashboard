"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AuditEntityType } from "../types";

interface AuditFiltersBarProps {
  entityType: AuditEntityType | "all";
  onEntityTypeChange: (value: AuditEntityType | "all") => void;
}

const ENTITY_OPTIONS: { value: AuditEntityType | "all"; label: string }[] = [
  { value: "all", label: "كل الأنشطة" },
  { value: "import", label: "الاستيراد" },
  { value: "holding_edit", label: "تعديلات الحيازات" },
  { value: "added_holding", label: "السجلات الميدانية" },
];

export function AuditFiltersBar({ entityType, onEntityTypeChange }: AuditFiltersBarProps) {
  return (
    <Select value={entityType} onValueChange={(v) => onEntityTypeChange(v as AuditEntityType | "all")}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ENTITY_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
