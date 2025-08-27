type DiscordChannel = {
    id: string;
    name: string;
    type: string;
    position: number;
    parent_id: string | null;
    guild_id: string;
};


export type { DiscordChannel };