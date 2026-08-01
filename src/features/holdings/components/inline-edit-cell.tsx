"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { useApplyHoldingEdit } from "../hooks/use-holding-mutations";
import type { EditableField } from "../core/editable-fields";
import type { MergedHolding } from "../core/merge-holding";
import { cn } from "@/lib/utils";

interface InlineEditCellProps {
  holding: MergedHolding;
  field: EditableField;
  cityId: string;
}

/** Click-to-edit cell — writes a holding_edits row on blur, never touches `holdings` directly. */
export function InlineEditCell({ holding, field, cityId }: InlineEditCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(String(holding[field] ?? ""));
  const applyEdit = useApplyHoldingEdit(cityId);
  const isFieldEdited = holding.editedFields.includes(field);

  function commit() {
    setIsEditing(false);
    const original = String(holding[field] ?? "");
    if (value === original) return;

    const isNumeric = typeof holding[field] === "number";
    const newValue = isNumeric ? Number(value) || 0 : value || null;

    applyEdit.mutate(
      { holdingId: holding.id, cityId, field, newValue },
      {
        onError: () => {
          toast.error("تعذر حفظ التعديل");
          setValue(original);
        },
      },
    );
  }

  if (isEditing) {
    return (
      <Input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            setValue(String(holding[field] ?? ""));
            setIsEditing(false);
          }
        }}
        className="h-8"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={cn(
        "group flex w-full items-center gap-1 rounded px-1 py-0.5 text-start hover:bg-muted",
        isFieldEdited && "font-medium text-primary",
      )}
    >
      <span>{value || "—"}</span>
      <Pencil className="size-3 opacity-0 group-hover:opacity-50" />
    </button>
  );
}
