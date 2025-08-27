// Base commune
type BaseAlerter<TType extends string, TConfig> = {
  id?: string;
  name: string;
  type: TType;
  config: TConfig;
  description?: string;
  all_rules?: boolean;
  rules?: { id: string; name: string }[];
  enabled?: boolean;
  created_at?: string;
  updated_at?: string;
};

// Configs spécifiques, props inchangées
type EmailConfig = {
  username?: string;
  password?: string;
  smtp_server?: string; 
  port?: number;
  from_address?: string;
  to_addresses?: string;
  cc_addresses?: string;
  firedSubjectTemplate?: string;
  firedMessageTemplate?: string;
  recoveredSubjectTemplate?: string;
  recoveredMessageTemplate?: string;
};

type DiscordConfig = {
  firedMessageTemplate?: string;
  recoveredMessageTemplate?: string;
  channelId: string;
  token: string;
  channelName?: string;
};

type SlackConfig = {
  firedMessageTemplate?: string;
  recoveredMessageTemplate?: string;
  channelId: string;
  token: string;
  channelName?: string;
};

type TelegramConfig = {
  firedMessageTemplate?: string;
  recoveredMessageTemplate?: string;
  chatId: string;
  token: string;
};

type TeamsConfig = {
  firedMessageTemplate?: string;
  recoveredMessageTemplate?: string;
  webhook: string;
  isAdaptiveCard?: boolean;
};

// Types finaux
export type EmailAlerter = BaseAlerter<"email", EmailConfig>;
export type DiscordAlerter = BaseAlerter<"discord", DiscordConfig>;
export type SlackAlerter = BaseAlerter<"slack", SlackConfig>;
export type TelegramAlerter = BaseAlerter<"telegram", TelegramConfig>;
export type TeamsAlerter = BaseAlerter<"teams", TeamsConfig>;

// Union globale
export type Alerter =
  | EmailAlerter
  | DiscordAlerter
  | SlackAlerter
  | TelegramAlerter
  | TeamsAlerter;
