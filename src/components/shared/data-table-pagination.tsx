import type { Table } from "@tanstack/react-table";
import { ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  totalRows?: number;
}

/** Pagination controls for DataTable — mirrored for RTL (chevrons point the opposite way). */
export function DataTablePagination<TData>({ table, totalRows }: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <div className="flex items-center justify-between px-2 py-3">
      <p className="text-sm text-muted-foreground">
        {totalRows !== undefined
          ? `${pageIndex * pageSize + 1}–${Math.min((pageIndex + 1) * pageSize, totalRows)} من ${totalRows}`
          : null}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          aria-label="الصفحة الأولى"
        >
          <ChevronsRight />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="الصفحة السابقة"
        >
          <ChevronRight />
        </Button>
        <span className="px-2 text-sm">
          {pageIndex + 1} / {Math.max(table.getPageCount(), 1)}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="الصفحة التالية"
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
          aria-label="الصفحة الأخيرة"
        >
          <ChevronsLeft />
        </Button>
      </div>
    </div>
  );
}
