'use client'
import React from "react";
import ReactDOM from "react-dom/client";
import { DataTable } from "./table";
import { columns } from "./columns";
import { users } from "./data";
import RulesTable from "@/components/RulesTable/page";
export default function Page() {
return (  

      <section className="pt-16 container">
        <RulesTable />
      </section>
);
}

