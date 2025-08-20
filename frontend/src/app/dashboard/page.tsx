'use client';
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { alertFieldMap, ruleFieldMap, ruleTypeFieldMap } from "@/lib/alertFieldMap";
import {Home } from "lucide-react";
import TitleCard from "@/components/menu/titleCard";

import {ObservabilityAlert} from "@/types/alerts";




export default function DashboardPage() {
    const [alerts, setAlerts] = useState<ObservabilityAlert[]>([]);
    const [rules, setRules] = useState<{ id: string; name: string }[]>([]);
    const alertColumns: Array<keyof typeof alertFieldMap> = Object.keys(alertFieldMap) as Array<keyof typeof alertFieldMap>;
    const ruleColumns: Array<keyof typeof ruleFieldMap> = Object.keys(ruleFieldMap) as Array<keyof typeof ruleFieldMap>;
    const [alerters, setAlerters] = useState([]);
    const [ruleTypeNames, setRuleTypeNames] = useState<{[id: string]: string}>({});
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
        fetch("/api/alerters")
            .then((res) => res.json())
            .then((data) => {
                setAlerters(data);
            });

    }, []);

   

    const cardClass = "p-6 border-none  shadow-none rounded-none w-full";
    const cardTitleClass = "text-sm font-bold mb-0";
    return (
       
            <Card className={cardClass}>

                <CardContent className="inline-flex gap-4 p-0 items-center justify-center" >
                    <Card className="w-[200px] mb-4 text-center">
                        <CardTitle className={cardTitleClass}>Alerters</CardTitle>
                        <CardContent className="p-0 text-center text-xl font-bold">
                                {alerters.length }
                            </CardContent>
                    </Card>
                    <Card className="w-[200px] mb-4 text-center">
                        <CardTitle className={cardTitleClass}>Rules</CardTitle>
                        <CardContent className="p-0 text-center text-xl font-bold">
                                {rules.length }
                            </CardContent>
                    </Card>
                    <Card className="w-[200px] mb-4 text-center">
                        <CardTitle className={cardTitleClass}>Active alerts</CardTitle>
                        <CardContent className="p-0 text-center text-xl font-bold">
                                {alerts.filter((alert) => {
                                    const source = alert._source as ObservabilityAlert["_source"];
                                    if( source && source["kibana.alert.status"] ) {
                                        return source["kibana.alert.status"] === "active";
                                    } else {        
                                        return null;
                                    }
                                }).length || 0 }
                            </CardContent>
                    </Card>
                    <Card className="w-[200px] mb-4 text-center">
                        <CardTitle className={cardTitleClass}>Day without alerts</CardTitle>
                        <CardContent className="p-0 text-center text-xl font-bold">
                                {rules.length }
                            </CardContent>
                    </Card>
                    <Card className="w-[200px] mb-4 text-center">
                        <CardTitle className={cardTitleClass}>Message sent</CardTitle>
                        <CardContent className="p-0 text-center text-xl font-bold">
                                {rules.length }
                            </CardContent>
                    </Card>
                   </CardContent>
            </Card>
           

       
    );
}