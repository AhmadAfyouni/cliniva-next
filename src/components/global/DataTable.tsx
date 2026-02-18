"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  /** Server-side total rows */
  totalCount: number;

  /** Controlled state (server-side) */
  pageIndex: number; // 0-based
  pageSize: number;
  sorting: SortingState;

  /** Callbacks you use to trigger API calls */
  onPaginationChange: (next: { pageIndex: number; pageSize: number }) => void;
  onSortingChange: (next: SortingState) => void;

  /** UI */
  pageSizeOptions?: number[];
  className?: string;

  /** Optional */
  isLoading?: boolean;
  emptyText?: string;

  /** Styling */
  rowHoverClassName?: string; // e.g. "hover:bg-emerald-50"
};

export function DataTable<TData, TValue>({
  columns,
  data,
  totalCount,
  pageIndex,
  pageSize = 10,
  sorting,
  onPaginationChange,
  onSortingChange,
  pageSizeOptions = [10, 20, 30, 50],
  className,
  isLoading = false,
  emptyText = "No results.",
  rowHoverClassName = "hover:bg-emerald-50",
}: DataTableProps<TData, TValue>) {
  const pageCount =
    totalCount === 0 ? 1 : Math.max(1, Math.ceil(totalCount / pageSize));

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: { pageIndex, pageSize },
      sorting,
    },
    manualPagination: true,
    manualSorting: true,
    pageCount,
    onPaginationChange: (updater) => {
      const prev = { pageIndex, pageSize };
      const next = typeof updater === "function" ? updater(prev) : updater;
      onPaginationChange(next);
    },
    onSortingChange: (updater) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      onSortingChange(next);
    },
    getCoreRowModel: getCoreRowModel(),
  });

  const current = table.getState().pagination.pageIndex;

  const visiblePages = React.useMemo(() => {
    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i);

    const pages = new Set<number>();
    pages.add(0);
    pages.add(pageCount - 1);

    [current - 1, current, current + 1].forEach((p) => {
      if (p >= 0 && p < pageCount) pages.add(p);
    });

    const sorted = [...pages].sort((a, b) => a - b);

    const withGaps: number[] = [];
    for (let i = 0; i < sorted.length; i++) {
      withGaps.push(sorted[i]);
      const next = sorted[i + 1];
      if (typeof next === "number" && next - sorted[i] > 1) withGaps.push(-1);
    }
    return withGaps;
  }, [pageCount, current]);

  const canPrev = current > 0;
  const canNext = current < pageCount - 1;

  const startRow = totalCount === 0 ? 0 : current * pageSize + 1;
  const endRow = Math.min(totalCount, (current + 1) * pageSize);

  return (
    <div
      className={[
        "w-full rounded-2xl bg-white overflow-hidden",
        className ?? "",
      ].join(" ")}
    >
      <Table>
        <TableHeader className="bg-white">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className={["border-border", rowHoverClassName].join(" ")}
            >
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sort = header.column.getIsSorted(); // 'asc' | 'desc' | false

                return (
                  <TableHead
                    key={header.id}
                    className={[
                      "h-12 text-xs font-medium text-black",
                      canSort ? "cursor-pointer select-none" : "",
                    ].join(" ")}
                    onClick={
                      canSort
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}

                      {canSort && (
                        <span className="text-black/70">
                          {sort === "asc" ? "↑" : sort === "desc" ? "↓" : "↕"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow className={`${rowHoverClassName}`}>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-black"
              >
                Loading…
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row, idx) => (
              <TableRow
                key={row.id}
                className={[
                  "border-border transition-colors",
                  //   idx % 2 === 0 ? "bg-white" : "bg-muted/10",
                  rowHoverClassName,
                ].join(" ")}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-4 text-sm text-black">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className={`${rowHoverClassName}`}>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-black"
              >
                {emptyText}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Footer */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-white">
        <div className="flex items-center gap-2 text-xs text-black">
          <span>
            Showing {startRow}-{endRow} of {totalCount}
          </span>

          <Select
            value={String(pageSize)}
            onValueChange={(v) =>
              onPaginationChange({ pageIndex: 0, pageSize: Number(v) })
            }
          >
            <SelectTrigger className="h-7 w-[80px] rounded-full bg-emerald-50 border-0 shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-muted/20 hover:bg-muted/30"
            onClick={() => onPaginationChange({ pageIndex: 0, pageSize })}
            disabled={!canPrev}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-muted/20 hover:bg-muted/30"
            onClick={() =>
              onPaginationChange({ pageIndex: pageIndex - 1, pageSize })
            }
            disabled={!canPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            {visiblePages.map((p, i) =>
              p === -1 ? (
                <span key={`gap-${i}`} className="px-1 text-muted-foreground">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPaginationChange({ pageIndex: p, pageSize })}
                  className={[
                    "h-8 min-w-8 px-3 rounded-full text-xs transition-colors",
                    p === pageIndex
                      ? "bg-emerald-500 text-white"
                      : "bg-emerald-50 text-foreground hover:bg-emerald-100",
                  ].join(" ")}
                >
                  {p + 1}
                </button>
              ),
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-muted/20 hover:bg-muted/30"
            onClick={() =>
              onPaginationChange({ pageIndex: pageIndex + 1, pageSize })
            }
            disabled={!canNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-muted/20 hover:bg-muted/30"
            onClick={() =>
              onPaginationChange({ pageIndex: pageCount - 1, pageSize })
            }
            disabled={!canNext}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
