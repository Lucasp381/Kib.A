"use client";
/* eslint-disable  @typescript-eslint/no-explicit-any */
import React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";
export type ExtendedColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  title?: string
  defaultVisible?: boolean
}
interface DataTableProps<TData, TValue> {
  columns: ExtendedColumnDef<TData, TValue>[];
  data: TData[];
  storageKey: string;
  globalFilterFn?: (row: any, columnId: string, filterValue: string) => boolean;
  DataTableToolbar: React.ComponentType<{ table: any; globalFilter: string; setGlobalFilter: (value: string) => void }>;
  dataTableActionCell?: React.ComponentType<{ row: any }>;
}

export default function DataTable<TData = unknown, TValue = unknown>({ columns, data, storageKey, globalFilterFn, DataTableToolbar, dataTableActionCell }: DataTableProps<TData, TValue>) {
  const STORAGE_KEY = storageKey + ":columnVisibility" || "datatable:columnVisibility";
  const [globalFilter, setGlobalFilter] = React.useState("");

  const buildDefaultVisibility = (): VisibilityState => {
    const state: VisibilityState = {};
    columns.forEach((col) => {
      if (col.id) {
        state[col.id] = (col as any).defaultVisible !== false;
      } else if ("accessorKey" in col && col.accessorKey) {
        state[col.accessorKey as string] =
          (col as any).defaultVisible !== false;
      }
    });
    return state;
  };

  const getInitialVisibility = (): VisibilityState => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return buildDefaultVisibility();
        }
      }
    }
    return buildDefaultVisibility();
  };

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(getInitialVisibility());
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      globalFilter,
    },
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    globalFilterFn,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
  });
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(columnVisibility));
  }, [columnVisibility]);
  return (
    <div className="space-y-4">
  <DataTableToolbar table={table} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {"No data results"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
