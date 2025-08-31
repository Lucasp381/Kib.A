'use client'
import { use, useEffect, useState } from "react";
import { columns, AlertItem } from "./columns";
import DataTable from "@/components/DataTable/data-table";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import TitleCard from "@/components/menu/titleCard";
import { Bell } from "lucide-react";
import { DataTableToolbar, globalFilterFn } from "./data-table-toolbar";

export default  function AlertsTable() {
    const [alertData, setAlertData] = useState([]);
    const cardClass = "p-6 border-none  border-blue-300 shadow-none rounded-none bg-herit pb-0 max-h-[80vh]";
    const cardTitleClass = "text-xl font-bold mb-0";
     useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(
           `/api/backend/elastic/index/alerts`
            );
            const result = await res.json();
            setAlertData(result.data || []);
        };

        fetchData();
    }, []);
    // Dans DataTable ou parent



  // In Our example we use local data
  return (
    <Card className={cardClass}>
                <CardTitle className={cardTitleClass}><TitleCard Icon={<Bell />} Title="Alerts" /></CardTitle>

      <DataTable<AlertItem> data={alertData} columns={columns} storageKey="alerts" globalFilterFn={globalFilterFn} DataTableToolbar={DataTableToolbar}   />
    </Card>
  );
}
