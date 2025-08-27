import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Trash2, Copy, TestTubeDiagonal } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { deleteDiscordAlerter, SetAndGetAlerters, saveDiscordAlerter } from "@/components/alerters/discord/DiscordService"; // Assurez-vous que ces fonctions existent
import { deleteSlackAlerter, saveSlackAlerter } from "@/components/alerters/slack/SlackService"; // Assurez-vous que cette fonction existe
import { deleteEmailAlerter, saveEmailAlerter } from "@/components/alerters/email/EmailService"; // Assurez-vous que cette fonction existe
import { Alerter, DiscordAlerter, EmailAlerter, SlackAlerter, TeamsAlerter, TelegramAlerter } from "@/types/alerters"; // Assurez-vous que ce type est défini correctement
import { deleteTeamsAlerter, saveTeamsAlerter } from "../teams/TeamsService";
import { deleteTelegramAlerter, saveTelegramAlerter } from "../telegram/TelegramService";
import axios from "axios";
interface EditButtonProps<T extends Alerter> {
    editAlerter: Alerter | null;
    alerters: Alerter[];
    setAlerters: React.Dispatch<React.SetStateAction<Alerter[]>>;
    setEditAlerter: React.Dispatch<React.SetStateAction<Alerter | null>>;
    loading: boolean;
    type: T["type"];
}

export default function EditButton<T extends Alerter>({ editAlerter, loading, alerters, setAlerters, setEditAlerter, type }: EditButtonProps<T>) {
    return (
        <Card className="sticky inline top-0 z-10 shadow-none border-none rounded-none  bg-card" >

            <CardContent className="flex gap-2 pb-5 pl-0  bg-card"  >
                <Button className={`w-[50px] cursor-pointer btn-color ${loading ? 'disabled' : ''} `} type="submit" title="Save"><Save className="" /></Button>
                <Button
                    className="w-[50px] cursor-pointer btn-color "
                    title="Duplicate"
                    onClick={() => {

                        axios.get("/api/backend/alerters?id=" + editAlerter?.id)
                            .then((res) => res.data)
                            .then((data) => {
                                // delete the id to create a new one
                                try {

                                    delete data.id;
                                    delete data.created_at;
                                    data.enabled = false; // Disable the duplicated alerter by default
                                    axios.post('/api/backend/alerters/duplicate', { originalId: editAlerter?.id })
                                        .then(async (data) => {
                                            await SetAndGetAlerters(type, setAlerters);
                                            setEditAlerter(data.data as Alerter);
                                        });


                                } catch (error) {
                                    toast.error("Error duplicating alerter");
                                }
                                toast.success("Alerter duplicated successfully!");
                                setAlerters((prev) => [...prev, data]);
                            })


                    }}
                    type="button"
                >
                    <Copy className="" />
                </Button>
                <Button
                    className="w-[50px]  btn-color "
                    title="Test"
                    onClick={() => {
                        toast.promise(
                            async () => {
                                let url = "";

                                let payload: Record<string, (string | number | boolean | undefined)> = {};

                                switch (type) {
                                    case "discord":
                                        const discord = editAlerter as DiscordAlerter;
                                        if (!discord?.config.token || !discord.config.channelId) {
                                            throw new Error("Token or Channel ID is missing.");
                                        }
                                        url = "/api/backend/alerters/discord/send";
                                        payload = {
                                            token: discord.config.token,
                                            id: discord.config.channelId,
                                            message: "This is a test message from Kib.A. If you received this, it means your Discord alerter is configured correctly!",
                                        };
                                        break;

                                    case "slack":
                                        const slack = editAlerter as SlackAlerter;
                                        if (!slack?.config.token || !slack.config.channelName) {
                                            throw new Error("Token or Channel Name is missing.");
                                        }
                                        url = "/api/backend/alerters/slack/send";
                                        payload = {
                                            token: slack.config.token,
                                            channelName: slack.config.channelName,
                                            message: "This is a test message from Kib.A. If you received this, it means your Slack alerter is configured correctly!",
                                        };
                                        break;

                                    case "email":
                                        const email = editAlerter as EmailAlerter;
                                        if (
                                            !email?.config.username ||
                                            !email.config.password ||
                                            !email.config.smtp_server ||
                                            !email.config.port ||
                                            !email.config.to_addresses
                                        ) {
                                            throw new Error("SMTP Server, Port, Username, Password, From Address or To Addresses are missing.");
                                        }
                                        url = "/api/backend/alerters/email/send";
                                        payload = {
                                            smtp_server: email.config.smtp_server,
                                            port: Number(email.config.port),
                                            username: email.config.username,
                                            password: email.config.password,
                                            from_address: email.config.from_address,
                                            to_addresses: email.config.to_addresses,
                                            cc_addresses: email.config.cc_addresses || "",
                                            subject: "Hello from Kib.A! 👋",
                                            message: "This is a test email from Kib.A. If you received this, it means your email alerter is configured correctly!",
                                        };
                                        break;

                                    case "teams":
                                        const teams = editAlerter as TeamsAlerter;
                                        if (!teams?.config.webhook) {
                                            throw new Error("Webhook is missing.");
                                        }
                                        url = "/api/backend/alerters/teams/send";
                                        payload = {
                                            webhook: teams.config.webhook,
                                            message: "This is a test message from Kib.A. If you received this, it means your Teams alerter is configured correctly!",
                                            isAdaptiveCard: false,
                                        };
                                        break;

                                    case "telegram":
                                        const telegram = editAlerter as TelegramAlerter;
                                        if (!telegram?.config.token || !telegram.config.chatId) {
                                            throw new Error("Token or Chat ID is missing.");
                                        }
                                        url = "/api/backend/alerters/telegram/send";
                                        payload = {
                                            chatId: telegram.config.chatId,
                                            token: telegram.config.token,
                                            message: "This is a test message from Kib.A. If you received this, it means your Telegram alerter is configured correctly!",
                                        };
                                        break;

                                    default:
                                        throw new Error("Unsupported alerter type");
                                }

                                const res = await fetch(url, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(payload),
                                });

                                const data = await res.json();
                                if (!data.success) {
                                    throw new Error(data.error || "Unknown error");
                                }

                                return data; // resolves -> success toast
                            },
                            {
                                loading: "Sending test message...",
                                success: "Test message sent successfully!",
                                error: (err) => JSON.stringify(err.message) || "Error sending test message",
                            }
                        );
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
                                deleteDiscordAlerter(editAlerter?.id || "", alerters as DiscordAlerter[], setAlerters as React.Dispatch<React.SetStateAction<DiscordAlerter[]>>, setEditAlerter as React.Dispatch<React.SetStateAction<DiscordAlerter | null>>);
                                break;
                            case "slack":
                                deleteSlackAlerter(editAlerter?.id || "", alerters as SlackAlerter[], setAlerters as React.Dispatch<React.SetStateAction<SlackAlerter[]>>, setEditAlerter as React.Dispatch<React.SetStateAction<SlackAlerter | null>>);
                                break;
                            case "email":
                                deleteEmailAlerter(editAlerter?.id || "", alerters as EmailAlerter[], setAlerters as React.Dispatch<React.SetStateAction<EmailAlerter[]>>, setEditAlerter as React.Dispatch<React.SetStateAction<EmailAlerter | null>>);
                                break;
                            case "teams":
                                deleteTeamsAlerter(editAlerter?.id || "", alerters as TeamsAlerter[], setAlerters as React.Dispatch<React.SetStateAction<TeamsAlerter[]>>, setEditAlerter as React.Dispatch<React.SetStateAction<TeamsAlerter | null>>);
                                break;
                            case "telegram":
                                deleteTelegramAlerter(editAlerter?.id || "", alerters as TelegramAlerter[], setAlerters as React.Dispatch<React.SetStateAction<TelegramAlerter[]>>, setEditAlerter as React.Dispatch<React.SetStateAction<TelegramAlerter | null>>);
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