import { Catch, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscordService } from 'src/alerters/discord/discord.service';
import { SlackService } from 'src/alerters/slack/slack.service';
import { TeamsService } from 'src/alerters/teams/teams.service';
import { EmailService } from 'src/alerters/email/email.service';
import { TelegramService } from 'src/alerters/telegram/telegram.service';
import { CryptService } from 'src/crypt/crypt.service';
import { IndexService } from 'src/elastic/index/index.service';
interface Alerter {
  _source?: {
    name?: string;
    type: string;
    enabled: boolean;
    "@timestamp"?: string;
    all_rules?: boolean;
    description?: string;
    rules?: { id: string }[];
    config?: object;
    _id?: string;
    created_at?: string;
    updated_at?: string;
  };

}
@Injectable()
export class WorkersService implements OnModuleInit {


  private readonly logger = new Logger(WorkersService.name);
  private readonly INTERVAL = process.env.POLL_EVERY ? parseInt(process.env.POLL_EVERY) * 1000 : 10000; // 10 secondes
  private readonly ELASTIC_ALERTS_INDEX = process.env.ELASTIC_ALERTS_INDEX || '*alerts-*';
  private readonly ELASTIC_ALERTERS_INDEX_NAME = process.env.KIBALERT_INDEX_PREFIX + '-alerters';
  private readonly FRONTEND_NODE = process.env.FRONTEND_NODE || 'http://frontend:3000';
  private readonly ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || undefined; // Clé de chiffrement par défaut
  private notifiedAlerts = new Set<string>();
  private isFirstRun = true; // <-- Ajout

  constructor(
    private readonly discordService: DiscordService,
    private readonly slackService: SlackService,
    private readonly teamsService: TeamsService,
    private readonly emailService: EmailService,
    private readonly cryptService: CryptService,
    private readonly indexService: IndexService,
    private readonly telegramService: TelegramService,
  ) { }

  onModuleInit() {
    this.logger.log('🚀 Worker Alerts démarré');
    setInterval(() => {
      this.pollAlerts();
    }, this.INTERVAL);
  }

  async pollAlerts() {
    try {
      this.logger.debug("👉 polling alerts...");

      //const alertsRes = await fetch(`${this.FRONTEND_NODE}/api/elastic/index?index=${this.ELASTIC_ALERTS_INDEX}`);
      const alerts = await this.indexService.findAllDocuments(this.ELASTIC_ALERTS_INDEX);

      this.logger.debug("✅ fetch done");

      if (!Array.isArray(alerts)) return;

      const activeAlerts = alerts.filter(a => a._source?.['kibana.alert.status'] === 'active');
      const recoveredAlerts = alerts.filter(a => a._source?.['kibana.alert.status'] === 'recovered');

      for (const alert of activeAlerts) {
        if (!alert._id) continue;
        const ruleId = alert._source?.['kibana.alert.rule.uuid'];
        if (!ruleId) continue;

        if (!this.notifiedAlerts.has(alert._id)) {
          this.notifiedAlerts.add(alert._id);

          // Si premier run, on n'envoie pas de notification
          if (!this.isFirstRun) {
            console.log("Sending notification for alert");
            await this.sendNotification(alert, ruleId, 'active');

          }
        }
      }

      for (const alert of recoveredAlerts) {
        if (!alert._id) continue;
        const ruleId = alert._source?.['kibana.alert.rule.uuid'];
        if (!ruleId) continue;

        if (this.notifiedAlerts.has(alert._id)) {
          this.notifiedAlerts.delete(alert._id);

          // Si premier run, on n'envoie pas de notification
          if (!this.isFirstRun) {
            await this.sendNotification(alert, ruleId, 'recovered');
          }
        }
      }

      const currentIds = new Set(alerts.map(a => a._id));
      for (const id of Array.from(this.notifiedAlerts)) {
        if (!currentIds.has(id)) {
          this.notifiedAlerts.delete(id);
          this.logger.log(`ℹ️ Alert ${id} not found anymore, removing from notifications.`);
        }
      }

      // Après premier cycle complet, désactive le flag
      if (this.isFirstRun) {
        this.isFirstRun = false;
        this.logger.log("✅ First run completed, notifications will now be sent.");
      }

    } catch (err) {
      this.logger.error('Erreur worker', err);
    }
  }

  private async sendNotification(alert, ruleId: string, status: 'active' | 'recovered' | 'flapping') {

    const alerters = await this.indexService.findAllDocuments(this.ELASTIC_ALERTERS_INDEX_NAME);
    if (!Array.isArray(alerters)) return;

    for (const alerter of alerters as any[]) {
      if (alerter._source?.rules?.some((r) => r.id === ruleId) || alerter._source?.all_rules) {
        try {


          let message = '';
          let payload = '';
          let subject = '';
          let token = '';
          let channelId = '';
          let chatId = '';
          let username = '';
          let password = '';
          let isAdaptiveCard = false;

          if (status === 'active' || status === 'flapping') {
            message = alerter._source?.config.firedMessageTemplate || `🚨 Alert fired: ${alert._source['kibana.alert.rule.name'] || ruleId}`;
            subject = alerter._source?.config.firedSubjectTemplate || '[Kibalbert] Alert Notification';
          } else {
            message = alerter._source?.config.recoveredMessageTemplate || `✅ Alert recovered: ${alert._source['kibana.alert.rule.name'] || ruleId}`;
            subject = alerter._source?.config.recoveredSubjectTemplate || '[Kibalbert] Alert Notification';
          }

          switch (alerter._source?.type) {
            case 'discord':
              // Discord: channelId and token can be encrypted
              channelId = alerter._source?.config.channelId;
              token = alerter._source?.config.token;
              if (this.ENCRYPTION_KEY !== undefined) {
                channelId = await this.cryptService.decrypt(alerter._source?.config.channelId, this.ENCRYPTION_KEY);
                token = await this.cryptService.decrypt(alerter._source?.config.token, this.ENCRYPTION_KEY);
              }
              await this.discordService.sendDiscordMessage(
                channelId,
                token,
                message,
                alert
              );
              break; // Sortie du switch après envoi Discord
            case 'slack':

              // Slack: token can be encrypted
              console.log("Sending message to Slack channel:", alerter._source?.config.channelName),
                token = alerter._source?.config.token;
              if (this.ENCRYPTION_KEY !== undefined) {
                token = await this.cryptService.decrypt(alerter._source?.config.token, this.ENCRYPTION_KEY);
              }
              await this.slackService.sendSlackMessage(
                alerter._source?.config.channelName,
                token,
                message,
                alert
              );
              break;


            case 'teams':
              payload = alerter._source?.config.payload || '';
              isAdaptiveCard = alerter._source?.config.isAdaptiveCard || false;

              await this.teamsService.sendTeamsMessage(
                alerter._source?.config.webhook,
                message,
                isAdaptiveCard,
                alert
              );
              break;
            case 'email':
              // Email: username and password can be encrypted
              username = alerter._source?.config.username;
              password = alerter._source?.config.password;
              if (this.ENCRYPTION_KEY !== undefined) {
                username = await this.cryptService.decrypt(alerter._source?.config.username, this.ENCRYPTION_KEY);
                password = await this.cryptService.decrypt(alerter._source?.config.password, this.ENCRYPTION_KEY);
              }
              await this.emailService.sendEmailMessage(
                alerter._source?.config.smtp_server,
                Number(alerter._source?.config.port),
                username,
                password,
                alerter._source?.config.from_address,
                alerter._source?.config.to_addresses.split(",").map((addr: string) => addr.trim()),
                alerter._source?.config.cc_addresses ? alerter._source?.config.cc_addresses.split(",").map((addr: string) => addr.trim()) : [],
                alerter._source?.config.subject || '[Kibalbert] Notification',
                message,
                alert
              );
              break;
            case 'telegram':
              
              if (this.ENCRYPTION_KEY !== undefined) {
                token = await this.cryptService.decrypt(alerter._source?.config.token, this.ENCRYPTION_KEY);
                chatId = await this.cryptService.decrypt(alerter._source?.config.chatId, this.ENCRYPTION_KEY);
              }
              await this.telegramService.sendTelegramMessage(
                token,
                chatId,
                message,
                alert
              );
                break;

            default:
              this.logger.warn(`Alerter type ${alerter._source?.type} non géré`);
              break;
          }
        } catch (error) {
          this.logger.error(`Error sending alert: ${error.message}`);
        }
      }
    }
  }
}
