'use client';
import { useEffect, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { alertFieldMap, ruleFieldMap } from "@/lib/alertFieldMap";
import { Bell, Cctv, Home, Send, Settings } from "lucide-react";
import TitleCard from "@/components/menu/titleCard";
import RulesTable from "@/components/RulesTable/RulesTable";
import AlertsTable from "@/components/AlertsTable/AlertsTable";




export default function DashboardPage() {
    const [alerts, setAlerts] = useState([]);
    const [rules, setRules] = useState<{ id: string; name: string }[]>([]);
    const alertColumns: Array<keyof typeof alertFieldMap> = Object.keys(alertFieldMap) as Array<keyof typeof alertFieldMap>;
    const ruleColumns: Array<keyof typeof ruleFieldMap> = Object.keys(ruleFieldMap) as Array<keyof typeof ruleFieldMap>;
    const [ruleTypeNames, setRuleTypeNames] = useState<{[id: string]: string}>({});
    useEffect(() => {
        fetch("/api/elastic/index?index=*alerts-*")
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

   

    const cardClass = "p-6 border-none  border-blue-300 shadow-none rounded-none bg-herit pb-0 max-h-[80vh]";
    const cardTitleClass = "text-xl font-bold mb-0";
    return (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-8  w-full">

            <Card className={cardClass}>
                <CardTitle className={cardTitleClass}><TitleCard Icon={<Bell />} Title="Alerts" /></CardTitle>
                <CardDescription className="text-main-500">
                    Here you can view the latest alerts from your Kibana instance.
                </CardDescription>
                <AlertsTable pageSize={5}/>
            </Card>
            <Separator />
            <Card className={cardClass}>
                {rules && rules.length > 0 && (
                    <>
                        <CardTitle className={cardTitleClass}><TitleCard Icon={<Cctv />} Title="Rules" /></CardTitle>
                        <CardDescription className="text-main-500">
                            Here you can view the latest rules from your Kibana instance.
                        </CardDescription>

                        <RulesTable  />
                    </>
                )
                }
            </Card>

        </div>
    );
}