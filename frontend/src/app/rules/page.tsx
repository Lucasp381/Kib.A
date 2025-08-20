'use client';
import { useEffect, useState} from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

import { Cctv } from "lucide-react";
import TitleCard from "@/components/menu/titleCard";
import RulesTable from "@/components/RulesTable/RulesTable";


export default function DashboardPage() {
  const [alerts, setAlerts] = useState([]);
    const [rules, setRules] = useState([]);

  useEffect(() => {
    fetch("/api/elastic/index?index=*alerts-observability*")
      .then((res) => res.json())
      .then((result) => {
        setAlerts(result.data);
      });
    fetch("/api/kibana/rules")
      .then((res) => res.json())
      .then((data) => {
        setRules(data);
      });
  }, []);

  



  const cardClass = "p-6 border-none border-gray-300 shadow-none rounded-none bg-herit";
  const cardTitleClass = "text-xl font-bold";

  return (
    <div className="grid grid-cols-1 gap-8 w-full">
                  <Card className={cardClass}>
                {rules && rules.length > 0 && (
                    <>
                     
                        <RulesTable  />
                    </>
                )
                }
            </Card>
    </div>
  );
}
