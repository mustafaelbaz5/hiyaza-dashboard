"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { AssociationTypeFormDialog } from "./association-type-form-dialog";
import { DeleteAssociationTypeDialog } from "./delete-association-type-dialog";
import { useAssociationTypes } from "../hooks/use-association-types";
import type { AssociationTypeOption } from "../types";

const columns: ColumnDef<AssociationTypeOption>[] = [
  { accessorKey: "code", header: "الكود" },
  { accessorKey: "labelAr", header: "التسمية بالعربية" },
  { accessorKey: "labelEn", header: "التسمية بالإنجليزية", cell: ({ row }) => row.original.labelEn ?? "—" },
  { accessorKey: "sortOrder", header: "ترتيب العرض" },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <AssociationTypeFormDialog existing={row.original} />
        <DeleteAssociationTypeDialog type={row.original} />
      </div>
    ),
  },
];

/**
 * Reference-data management for association_types — the registry backing
 * cities.association_type_code. Adding a type here makes it selectable in the city form
 * immediately, with no deploy required (REFACTOR_ROADMAP.md Phase 3).
 */
export function AssociationTypesTable() {
  const { data, isLoading, error, refetch } = useAssociationTypes();
  const rows = useMemo(() => data ?? [], [data]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AssociationTypeFormDialog />
      </div>
      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        error={error ? "تعذر تحميل أنواع الجمعيات" : undefined}
        onRetry={() => refetch()}
        emptyTitle="لا توجد أنواع جمعيات بعد"
      />
    </div>
  );
}
