'use client';
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import {  Code } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHelmetSafety } from "@fortawesome/free-solid-svg-icons";
import { faDiscord, faSlack, faMicrosoft, faTelegram,  } from "@fortawesome/free-brands-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import DiscordAlerterTab from "@/components/alerters/discord/DiscordAlerterTab";
import SlackAlerterTab from '@/components/alerters/slack/SlackAlerterTab';
import EmailAlerterTab from '@/components/alerters/email/EmailAlerterTab';
import TeamsAlerterTab from '@/components/alerters/teams/TeamsAlerterTab';

import { Alerter } from "@/types/alerters";
import TelegramAlerterTab from '@/components/alerters/telegram/TelegramAlerterTab';
const cardClass = "p-6 border-none border-gray-300 shadow-none rounded-none bg-herit";




const tabs = [
  { value: "discord", label: "Discord", icon: <FontAwesomeIcon icon={faDiscord} className="text-main-500" /> },
  { value: "slack", label: "Slack", icon: <FontAwesomeIcon icon={faSlack} className="text-main-500" /> },
  { value: "email", label: "Email", icon: <FontAwesomeIcon icon={faEnvelope} className="text-main-500" /> },
  { value: "teams", label: "Teams", icon: <FontAwesomeIcon icon={faMicrosoft} className="text-main-500" /> },
  { value: "telegram", label: "Telegram", icon: <FontAwesomeIcon icon={faTelegram} className="text-main-500" /> },
  { value: "custom", label: "Custom", icon: <Code className="text-main-500" /> },
];

export default function AlertersView() {


  const [activeTab, setActiveTab] = useState("discord");

  return (
    <Card className={cardClass}>
     
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full p-0 m-0">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.icon} {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="w-full">
              
              {tab.value === activeTab ? (
                (() => {
                  switch (tab.value) {
                    case "discord":
                      return (
                        <DiscordAlerterTab
                        />
                      );
                    case "slack":
                      return (
                        <SlackAlerterTab
                         
                        />
                      )
                    case "teams":
                      return (
                        <TeamsAlerterTab
                        
                        />
                      );
                    case "email":
                      return (
                        <EmailAlerterTab
                         
                        />
                      )
                    case "telegram":
                      return (
                        <TelegramAlerterTab
                       
                        />
                      )
                    case "custom":
                      return <Card className='text-2xl text-center  h-[calc(100vh-190px)] flex items-center justify-center'><FontAwesomeIcon icon={faHelmetSafety} className='scale-300 text-main-500' />{tab.value.charAt(0).toUpperCase() + tab.value.slice(1)} alerter is not implemented yet.</Card>;
                    default:
                      return <div>Select a valid alerter type.</div>;
                  }
                })()
              ) : (
                <div className="flex items-center justify-center">
                  <p className="text-gray-500">No {tab.label} alerters configured.</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      
    </Card>
  );
}
