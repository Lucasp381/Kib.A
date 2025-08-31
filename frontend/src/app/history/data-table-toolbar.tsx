//data-table-toolbar.tsx
"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Row, Table } from "@tanstack/react-table";
import { DataTableFacetedFilter } from "@/components/DataTable/data-table-faceted-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/DataTable/data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
}
const alerterType = [
  { value: "discord", label: "Discord" },
  { value: "slack", label: "Slack" },
  { value: "email", label: "Email" },
  { value: "teams", label: "Teams" },
  { value: "telegram", label: "Telegram" },
  { value: "custom", label: "Custom" },
];
export const globalFilterFn = <TData,>(row: Row<TData>, columnId: string, filterValue: string) => {
    const search = filterValue.toLowerCase();

    const searchableCols = [
      "_source.meta.alerter.name",
      "_source.meta.rule.name",
      "_source.message",
      "_id",
      "_source.meta.alerter.id",
    ];

    return searchableCols.some((col) => {
      const value = row.getValue(col);
      return value ? String(value).toLowerCase().includes(search) : false;
    });
  };
export function DataTableToolbar<TData>({ table, globalFilter, setGlobalFilter }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={"Find..."}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {table.getColumn("_source.meta.alerter.type") && (
          <DataTableFacetedFilter
            column={table.getColumn("_source.meta.alerter.type")}
            title={"Type"}
            options={alerterType}
          />
        )}
        
                {/*
          adding date picker to filter Timestamp
        */}
        <Input
          type="date"
          placeholder={"Filter by date"}
          value={(table.getColumn("_source.@timestamp")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("_source.@timestamp")?.setFilterValue(event.target.value)}
          className="h-8 w-fit "
        />


        {isFiltered && (
          <Button
            variant="outline"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3">
            {"Clean Filters"}
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}


        
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
