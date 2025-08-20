
export interface DiscordConfigType {
    token: string;
    channel_id: string;
    message: string;
}
export interface EmailConfigType {
    smtp_server: string;
    port: number;
    username: string;
    password: string;
    from_address: string;
    to_addresses: string[];
    subject: string;
    body: string;
}
export interface SlackConfigType {
    webhook_url: string;
}
export interface WebhookConfigType {
    url: string;
}

export type Alerter =  SlackAlerter | DiscordAlerter | EmailAlerter 



export type EmailAlerter = {
    id?: string;
    name: string;
    type: "email";
    config: {
        smtp_server: string;
        port: number;
        username: string;
        password: string;
        from_address: string;
        to_addresses: string;
        cc_addresses?: string;
        firedMessageTemplate?: string;
        recoveredMessageTemplate?: string;
        firedSubjectTemplate?: string;
        recoveredSubjectTemplate?: string;
    }
    description?: string; // <- optionnel   
    all_rules?: boolean;
    rules?: { id: string; name: string }[];
    enabled?: boolean;
    created_at?: string;
    updated_at?: string;
};


export type DiscordAlerter = {
    id?: string;
    name: string;
    type: "discord";
    config: {
        firedMessageTemplate?: string;
        recoveredMessageTemplate?: string;
        channelId: string;
        token: string;
        channelName?: string;
    };
    description?: string; // <- optionnel
    all_rules?: boolean;
    rules?: { id: string; name: string }[];
    enabled?: boolean;
    created_at?: string;
    updated_at?: string;
};

export type SlackAlerter = {
    id?: string;
    name: string;
    type: "slack" 
    config: {
        firedMessageTemplate?: string;
        recoveredMessageTemplate?: string;
        channelId: string;
        token: string;
        channelName?: string;
    };
    description?: string; // <- optionnel
    all_rules?: boolean;
    rules?: { id: string; name: string }[];
    enabled?: boolean;
    created_at?: string;
    updated_at?: string;
};