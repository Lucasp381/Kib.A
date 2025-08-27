import React from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dot } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alerter, EmailAlerter, SlackAlerter, DiscordAlerter, TeamsAlerter, TelegramAlerter } from "@/types/alerters";
interface AlertersMenuProps<T extends Alerter> {
    alerters: Alerter[];
    editAlerter: T | null;
    setEditAlerter: React.Dispatch<React.SetStateAction<Alerter | null>>;
    type: T["type"];
}
export default function AlertersMenu<T extends Alerter>({ alerters, editAlerter, setEditAlerter, type }: AlertersMenuProps<T>) {
    return (

        <ScrollArea className="max-h-[calc(100vh-300px)] w-full">
            {alerters.map((alerter: Alerter) => (
                <React.Fragment key={alerter.id}>
                    <Badge
                        onClick={() => setEditAlerter(alerter)}
                        className={`${editAlerter?.id === alerter.id ? "bg-accent" : "bg-card"
                            } cursor-pointer justify-between w-full m-0 h-15  text-md shadow-none mr-5`}
                    >
                        <div className="pt-2 gap-2 max-w-45 overflow-hidden">
                            <Label
                                title={alerter.name}
                                className={`
                                    ${editAlerter?.name === alerter.name ? "text-accent-foreground" : "text-card-foreground"}
                                    cursor-pointer
                                    overflow-hidden
                                    whitespace-nowrap
                                    text-ellipsis
                                    w-40 
                                    max-w-62
                                `}
                            >
                                {alerter.name}
                            </Label>
                            {(() => {
                                switch (type) {
                                    case "email":
                                        const emailConfig = alerter.config as EmailAlerter["config"];
                                        return <small className="text-xs text-main-900 overflow-hidden ">{emailConfig.from_address}</small>;
                                    case "discord":
                                        const discordConfig = alerter.config as DiscordAlerter["config"];
                                        { discordConfig.channelName ? (
                                            <small className="text-xs text-main-900 overflow-hidden">{discordConfig.channelName}</small>
                                        ) : null }
                                    case "slack":
                                        const slackConfig = alerter.config as SlackAlerter["config"];
                                        return <small className="text-xs text-main-900 overflow-hidden">{slackConfig.channelName || slackConfig.channelId}</small>;
                                    case "teams":
                                        const teamsConfig = alerter.config as TeamsAlerter["config"];
                                        { alerter ? <small className="text-xs text-main-900 overflow-hidden">ddd</small> : null }
                                    default:
                                        return null;
                                }
                            })()}

                        </div>

                        {(() => {
                            switch (type) {
                                case "email":
                                    const emailConfig = alerter.config as EmailAlerter["config"];
                                    return (
                                        <Dot
                                            className={`${alerter.enabled && emailConfig.smtp_server && emailConfig.username && emailConfig.password
                                                ? "text-green-500"
                                                : !emailConfig.username && !emailConfig.password
                                                    ? "text-yellow-500"
                                                    : "text-gray-500"
                                                } mr-5 scale-500`}
                                        />
                                    )
                                case "discord":
                                    const discordConfig = alerter.config as DiscordAlerter["config"];
                                    return (
                                        <Dot
                                            className={`${alerter.enabled && discordConfig.token && discordConfig.channelId
                                                ? "text-green-500"
                                                : !discordConfig.token && !discordConfig.channelId
                                                    ? "text-yellow-500"
                                                    : "text-gray-500"
                                                } mr-5 scale-500`}
                                        />
                                    )
                                case "slack":
                                    const slackConfig = alerter.config as SlackAlerter["config"];
                                    return (
                                        <Dot
                                            className={`${alerter.enabled && slackConfig.token && slackConfig.channelId
                                                ? "text-green-500"
                                                : !slackConfig.token && !slackConfig.channelId
                                                    ? "text-yellow-500" : "text-gray-500"
                                                } mr-5 scale-500`}
                                        />
                                    )
                                case "teams":
                                    const teamsConfig = alerter.config as TeamsAlerter["config"];
                                    return (
                                        <Dot
                                            className={`${alerter.enabled && teamsConfig.webhook
                                                ? "text-green-500"
                                                : !teamsConfig.webhook
                                                    ? "text-yellow-500"
                                                    : "text-gray-500"
                                                } mr-5 scale-500`}
                                        />
                                    )
                                case "telegram":
                                    const telegramConfig = alerter.config as TelegramAlerter["config"];
                                    return (
                                        <Dot
                                            className={`${alerter.enabled && telegramConfig.token && telegramConfig.chatId
                                                ? "text-green-500"
                                                : !telegramConfig.token && !telegramConfig.chatId
                                                    ? "text-yellow-500"
                                                    : "text-gray-500"
                                                } mr-5 scale-500`}
                                        />
                                            )
                                default:
                                    return null;
                            }

                        })
                            ()}



                    </Badge>
                    <Separator />
                </React.Fragment>
            ))}
        </ScrollArea>
        
    );
}