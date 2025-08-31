'use client';
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bell, Cctv } from "lucide-react";
import TitleCard from "@/components/menu/titleCard";
import RulesTable from "@/components/RulesTable/page";
import AlertsTable from "@/components/AlertsTable/page";




export default function DashboardPage() {


    const cardClass = "p-6 border-none  border-blue-300 shadow-none rounded-none bg-herit pb-0 max-h-[80vh]";
    const cardTitleClass = "text-xl font-bold mb-0";
    return (
        <div className="grid grid-cols-1 md:grid-cols-1 gap-8  w-full">


                

                <AlertsTable />
               
               
            
            <Separator />
            
                    <RulesTable  />
                   

        </div>
    );
}