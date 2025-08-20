'use client';
import { useEffect, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { alertFieldMap, ruleFieldMap } from "@/lib/alertFieldMap";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import TitleCard from "@/components/menu/titleCard";
import AlertsTable from "@/components/AlertsTable/AlertsTable";
import { useElasticKV } from "@/hooks/useElasticKV";



export default function DashboardPage() {
  const [alerts, setAlerts] = useState([]);

  const alertColumns: Array<keyof typeof alertFieldMap> = Object.keys(alertFieldMap) as Array<keyof typeof alertFieldMap>;



  useEffect(() => {
    fetch("/api/elastic/index?index=*alerts-*")
      .then((res) => res.json())
      .then((result) => {
        setAlerts(result.data);
      });

  }, []);

  const cardClass = "p-6 border-none border-gray-300 shadow-none rounded-none bg-herit ";
  const cardTitleClass = "text-xl font-bold";

  return (
    <div className="grid grid-cols-1 gap-8 w-full">
      <Card className={cardClass}>


  

        {/* Scrollable body */}
          <AlertsTable />
      </Card>
    </div>
  );
}
