import React from "react";
import { Button } from "@/components/ui/button";
import {  Save, Trash2, Copy, TestTubeDiagonal } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {  deleteDiscordAlerter,  saveDiscordAlerter } from "@/components/alerters/discord/DiscordService"; // Assurez-vous que ces fonctions existent
import { deleteSlackAlerter, saveSlackAlerter, sendSlackTestMessage,} from "@/components/alerters/slack/SlackService"; // Assurez-vous que cette fonction existe
import { sendEmailTestMessage, deleteEmailAlerter,  saveEmailAlerter } from "@/components/alerters/email/EmailService"; // Assurez-vous que cette fonction existe
import { Alerter, DiscordAlerter, EmailAlerter, SlackAlerter } from "@/types/alerters"; // Assurez-vous que ce type est défini correctement

interface EditButtonProps<T extends Alerter> {
    editAlerter: T | null;
    alerters: T[];
    setAlerters: React.Dispatch<React.SetStateAction<T[]>>;
    setEditAlerter?: React.Dispatch<React.SetStateAction<T | null>>;
    loading: boolean;
    type: T["type"];
}

export default function EditButton<T extends Alerter>({ editAlerter, loading, alerters, setAlerters, setEditAlerter, type }: EditButtonProps<T>) {
    return (
        <Card className="sticky inline top-0 z-10 shadow-none border-none rounded-none  bg-card" >

            <CardContent className="flex gap-2 pb-5 pl-0  bg-card"  >
                <Button className={`w-[50px] cursor-pointer btn-color ${loading ? 'disabled' : ''} `} type="submit" title="Save"><Save className=""/></Button>
                <Button
                    className="w-[50px] cursor-pointer btn-color "
                    title="Duplicate"
                    onClick={() => {
                        
                        fetch("/api/alerters?id=" + editAlerter?.id)
                            .then((res) => res.json())  
                            .then((data) => {
                                // delete the id to create a new one
                                delete data.id;
                                delete data.created_at;
                                data.enabled = false; // Disable the duplicated alerter by default
                                switch (type) {
                                    case "discord":
                                        saveDiscordAlerter(data, setAlerters as React.Dispatch<React.SetStateAction<DiscordAlerter[]>> ,setEditAlerter as React.Dispatch<React.SetStateAction<DiscordAlerter | null>>);
                                        break;
                                    case "slack":
                                        saveSlackAlerter(data, setAlerters as React.Dispatch<React.SetStateAction<SlackAlerter[]>> , setEditAlerter as React.Dispatch<React.SetStateAction<SlackAlerter | null>>);
                                        break;
                                    case "email":
                                        saveEmailAlerter(data, setAlerters as React.Dispatch<React.SetStateAction<EmailAlerter[]>> , setEditAlerter as React.Dispatch<React.SetStateAction<EmailAlerter | null>>);
                                        break;

                                        
                                }

                                toast.success("Alerter duplicated successfully!");
                            })
                            
                        
                    }}
                    type="button"
                >
                    <Copy className="" />
                </Button>
                <Button
                    className="w-[50px]  btn-color "
                    title="Test"
                    onClick={async () => {
                        switch (type) {
                            case "discord":

                                const DiscordAlerter = editAlerter as DiscordAlerter;
                                if (DiscordAlerter?.config.token && DiscordAlerter.config.channelId) {
                                    await fetch("/api/alerters/discord/send", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            token: DiscordAlerter.config.token,
                                            id: DiscordAlerter.config.channelId,
                                            message: "Hello from KibAlbert! :wave:"
                                        })
                                    }).then((res) => res.json()).then((data) => {
                                        // Handle the response from the API
                                        toast.success("Test message sent successfully!");
                                    }).catch((error) => {
                                        toast.error("Error sending test message: " + error.message);
                                    });
                                } else {
                                    toast.error("Token or Channel ID is missing.");
                                }
                                    
                                break;
                            case "slack":
                                const SlackAlerter = editAlerter as SlackAlerter;
                                if (SlackAlerter && SlackAlerter.config.token && SlackAlerter.config.channelName) {
                                     await fetch("/api/alerters/slack/send", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            token: SlackAlerter.config.token,
                                            name: SlackAlerter.config.channelName,
                                            message: "Hello from KibAlbert! :wave:"
                                        })
                                    }).then((res) => res.json()).then((data) => {
                                        // Handle the response from the API
                                        toast.success("Test message sent successfully!");
                                    }).catch((error) => {
                                        toast.error("Error sending test message: " + error.message);
                                    });

                                } else {
                                    toast.error("Token or Channel Name is missing.");
                                }
                                    
                                break;
                            case "email":
                                const EmailAlerter = editAlerter as EmailAlerter;
                                
                                if (EmailAlerter && EmailAlerter.config.username && EmailAlerter.config.password && EmailAlerter.config.smtp_server && EmailAlerter.config.port && EmailAlerter.config.to_addresses) {
                                    await fetch("/api/alerters/email/send", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            smtp_server: EmailAlerter.config.smtp_server,
                                            port: Number(EmailAlerter.config.port),
                                            username: EmailAlerter.config.username,
                                            password: EmailAlerter.config.password,
                                            from_address: EmailAlerter.config.from_address,
                                            to_addresses: EmailAlerter.config.to_addresses,
                                            cc_addresses: EmailAlerter.config.cc_addresses || "",
                                            subject: "Hello from KibAlbert! :wave:",
                                            message: "This is a test email from KibAlbert. If you received this, it means your email alerter is configured correctly!"
                                        })
                                    }).then((res) => res.json()).then((data) => {
                                        // Handle the response from the API
                                        if (!data.success) {
                                            throw new Error(data.error || "Unknown error");
                                        }
                                        toast.success("Test message sent successfully!");
                                    }).catch((error) => {
                                        toast.error("Error sending test message: " + error.message);
                                    });

                                } else {
                                    toast.error("SMTP Server, Port, Username, Password, From Address or To Addresses are missing.");
                                }
                                break;
                        }
                    }}
                    type="button"
                >
                    <TestTubeDiagonal />
                </Button>

                <Button
                    className="w-[50px] btn-color destructive"
                    title="Delete"
                    onClick={() => {
                        switch (type) {
                            case "discord":
                                deleteDiscordAlerter(editAlerter?.id || "" , alerters as DiscordAlerter[], setAlerters as React.Dispatch<React.SetStateAction<DiscordAlerter[]>>, setEditAlerter as React.Dispatch<React.SetStateAction<DiscordAlerter | null>>);
                                break;
                            case "slack":
                                deleteSlackAlerter(editAlerter?.id || "", alerters as SlackAlerter[], setAlerters as React.Dispatch<React.SetStateAction<SlackAlerter[]>>, setEditAlerter as React.Dispatch<React.SetStateAction<SlackAlerter | null>>);
                                break;
                            case "email":
                                deleteEmailAlerter(editAlerter?.id || "", alerters as EmailAlerter[], setAlerters as React.Dispatch<React.SetStateAction<EmailAlerter[]>>, setEditAlerter as React.Dispatch<React.SetStateAction<EmailAlerter | null>>);
                                break;
                        }

                    }}
                    type="button"
                >
                    <Trash2 className="" />
                </Button>
            </CardContent>
        </Card>
    );
}