'use client';
import { useEffect, useState } from "react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bell, Cctv } from "lucide-react";
import TitleCard from "@/components/menu/titleCard";
import RulesTable from "@/components/RulesTable/RulesTable";
import AlertsTable from "@/components/AlertsTable/AlertsTable";




export default function DashboardPage() {





    const cardClass = "p-6 border-none  border-blue-300 shadow-none rounded-none bg-herit pb-0 max-h-[80vh]";
    const cardTitleClass = "text-xl font-bold mb-0";
    return (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-8  w-full">

            <Card className={cardClass}>
                <CardTitle className={cardTitleClass}><TitleCard Icon={<Bell />} Title="Alerts" /></CardTitle>
                <CardDescription className="text-main-500">
                    Here you can view the latest alerts from your Kibana instance.
                </CardDescription>
                

                <AlertsTable pageSize={10}/>
               
               
            </Card>
            <Separator />
            <Card className={cardClass}>
               
                    <>
                        <CardTitle className={cardTitleClass}><TitleCard Icon={<Cctv />} Title="Rules" /></CardTitle>
                        <CardDescription className="text-main-500">
                            Here you can view the latest rules from your Kibana instance.
                        </CardDescription>
                   
                    <RulesTable  />
                   
                
                    </>

            </Card>

        </div>
    );
}