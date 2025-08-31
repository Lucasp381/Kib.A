"use client";
import { useState, useEffect } from "react";
// import { UserSchema } from "@/app/users/userSchema";
import Link from "next/link";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RuleItem } from "./columns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  kibanaUrl: string;
}



export  function DataTableRowActions<TData>({ row, kibanaUrl }: DataTableRowActionsProps<TData>) {
  // const user = UserSchema.parse(row.original);
  // console.log(user.id); // Note: use the id for any action (example: delete, view, edit)


  const RuleItem = row.original as RuleItem;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">{"Open Menu"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="cursor-pointer">
            <Link href={`${kibanaUrl}/app/observability/alerts/${RuleItem.id}`} target="_blank" className="flex items-center w-full">
              <Eye className="w-4 h-4 text-blue-500" />
              {<span className="ml-2">{"View rule"}</span>}
            </Link>
        </DropdownMenuItem>


      </DropdownMenuContent>
    </DropdownMenu>
  );
}
