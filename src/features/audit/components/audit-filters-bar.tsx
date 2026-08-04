"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AuditEntityType, AuditFilters } from "../types";

interface AuditFiltersBarProps {
  filters: AuditFilters;
  onFiltersChange: (filters: AuditFilters) => void;
}

const ENTITY_OPTIONS: { value: AuditEntityType | "all"; label: string }[] = [
  { value: "all", label: "كل الأنشطة" },
  { value: "import", label: "الاستيراد" },
  { value: "holding_edit", label: "تعديلات الحيازات" },
  { value: "added_holding", label: "السجلات الميدانية" },
  { value: "city_management", label: "إدارة الجمعيات" },
  { value: "user_management", label: "إدارة المستخدمين" },
];

export function AuditFiltersBar({ filters, onFiltersChange }: AuditFiltersBarProps) {
  const entityType = filters.entityType || "all";

  return (
    <div className="flex gap-3 flex-wrap items-center">
      <Select
        value={entityType}
        onValueChange={(v) =>
          onFiltersChange({
            ...filters,
            entityType: v === "all" ? undefined : (v as AuditEntityType),
          })
        }
      >
        <SelectTrigger className="w-48" aria-label="نوع النشاط">
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

      {/* Date From */}
      <input
        type="date"
        value={filters.dateFrom || ""}
        onChange={(e) =>
          onFiltersChange({
            ...filters,
            dateFrom: e.target.value || undefined,
          })
        }
        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        aria-label="من تاريخ"
        placeholder="من تاريخ"
      />

      {/* Date To */}
      <input
        type="date"
        value={filters.dateTo || ""}
        onChange={(e) =>
          onFiltersChange({
            ...filters,
            dateTo: e.target.value || undefined,
          })
        }
        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        aria-label="إلى تاريخ"
        placeholder="إلى تاريخ"
      />

      {/* Clear Filters */}
      {(filters.entityType || filters.dateFrom || filters.dateTo || filters.cityId || filters.userId) && (
        <button
          onClick={() =>
            onFiltersChange({
              cityId: filters.cityId, // preserve city scope if set
            })
          }
          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          مسح الفلاتر
        </button>
      )}
    </div>
  );
}
