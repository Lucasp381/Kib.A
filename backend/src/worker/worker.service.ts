
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscordService } from 'src/alerters/discord/discord.service';
import { SlackService } from 'src/alerters/slack/slack.service';
import { TeamsService } from 'src/alerters/teams/teams.service';
import { EmailService } from 'src/alerters/email/email.service';
import { TelegramService } from 'src/alerters/telegram/telegram.service';
import { CryptService } from 'src/crypt/crypt.service';
import { IndexService } from 'src/elastic/index/index.service';
import { UtilsService } from 'src/utils/utils.service';
@Injectable()
export class WorkersService implements OnModuleInit {
  private readonly logger = new Logger(WorkersService.name);
  private readonly INTERVAL =
    process.env.POLL_EVERY ? parseInt(process.env.POLL_EVERY) * 1000 : 10000;
  private readonly ELASTIC_ALERTS_INDEX = process.env.ELASTIC_ALERTS_INDEX || '*alerts-*';
  private readonly ELASTIC_ALERTERS_INDEX_NAME = process.env.KIBA_INDEX_PREFIX + '-alerters';
  private readonly ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || undefined; // Clé de chiffrement par défaut
  private intervalId: NodeJS.Timeout | null = null;
  private notifiedAlerts = new Set<string>();
  private isFirstRun = true;
  private pausedUntil: Date | null = null;
  private suppressedAlerts = new Set<string>();

  public muted = false;

  constructor(
    private readonly discordService: DiscordService,
    private readonly slackService: SlackService,
    private readonly teamsService: TeamsService,
    private readonly emailService: EmailService,
    private readonly cryptService: CryptService,
    private readonly indexService: IndexService,
    private readonly telegramService: TelegramService,
    private readonly utilsService: UtilsService,
  ) { }

  private state: "running" | "paused" | "stopped" = "stopped";

  onModuleInit() {
    this.logger.log("🚀 WorkersService initialized");
    this.start();
  }

  start() {
    if (this.state === "running") {
      this.logger.warn("⚠️ Worker already running.");
      return;
    }
    this.logger.log("▶️ Starting worker...");
    this.intervalId = setInterval(() => this.pollAlerts(), this.INTERVAL);
    this.state = "running";
    this.pausedUntil = null;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.state = "stopped";
    this.pausedUntil = null;
    this.logger.log("⏹ Worker stopped.");
  }

  pause(minutes: number) {


    this.pausedUntil = new Date(Date.now() + minutes * 60 * 1000);
    this.state = "paused";
    this.logger.log(`⏸ Worker paused until ${this.pausedUntil.toISOString()}`);

    // Remise à running automatique après la pause
    setTimeout(() => {
      if (this.state === "paused" && this.pausedUntil && new Date() >= this.pausedUntil) {
        this.logger.log("🔄 Resuming worker after pause...");
        this.state = "running"; // ne pas appeler start(), le worker est déjà actif
        this.pausedUntil = null;
      }
    }, minutes * 60 * 1000 + 1000);
  }


  isPaused(): boolean {
    return this.state === "paused";
  }

  getStatus() {
    return {
      state: this.state,
      running: this.state === "running",
      paused: this.state === "paused",
      pausedUntil: this.pausedUntil,
    };
  }
  async pollAlerts() {
    try {
      this.logger.debug("🔄 Polling for alerts...");
      const alerts = await this.indexService.findAllDocuments(this.ELASTIC_ALERTS_INDEX, 1000);
      if (!Array.isArray(alerts.data)) return;

      const activeAlerts = alerts.data.filter(a => a._source?.['kibana.alert.status'] === 'active');
      const recoveredAlerts = alerts.data.filter(a => a._source?.['kibana.alert.status'] === 'recovered');

      const paused = this.state === "paused";

      // Active alerts
      for (const alert of activeAlerts) {
        if (!alert._id) continue;
        const ruleId = alert._source?.['kibana.alert.rule.uuid'];
        if (!ruleId) continue;

        if (!this.notifiedAlerts.has(alert._id)) {
          this.notifiedAlerts.add(alert._id);

          if (paused) {
            this.logger.debug(`🔇 Worker paused, suppressing notification for alert ${alert._id}`);
            this.suppressedAlerts.add(alert._id);
          } else if (!this.isFirstRun) {
            this.logger.debug(`🔔 Sending notification for alert ${alert._id}`);
            await this.sendNotification(alert, ruleId, 'active');
          }
        }
      }

      // Recovered alerts
      for (const alert of recoveredAlerts) {
        if (!alert._id) continue;
        const ruleId = alert._source?.['kibana.alert.rule.uuid'];
        if (!ruleId) continue;

        if (this.notifiedAlerts.has(alert._id)) {
          this.notifiedAlerts.delete(alert._id);

          // Notification only if not suppressed
          if (!this.suppressedAlerts.has(alert._id) && !this.isFirstRun && this.state === "running") {
            this.logger.debug(`🔔 Sending notification for alert ${alert._id}`);

            await this.sendNotification(alert, ruleId, 'recovered');
          } else {
            this.logger.debug(`🔇 Suppressing notification for alert ${alert._id}`);
            this.suppressedAlerts.delete(alert._id);
          }
        }
      }

      // Cleanup
      const currentIds = new Set(alerts.data.map(a => a._id));
      for (const id of Array.from(this.notifiedAlerts)) {
        if (!currentIds.has(id)) {
          this.notifiedAlerts.delete(id);
          this.logger.log(`ℹ️ Alert ${id} not found anymore, removing from notifications.`);
        }
      }

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
    if (!Array.isArray(alerters.data)) return;

    for (const alerter of alerters.data as any[]) {
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
            subject = alerter._source?.config.firedSubjectTemplate || '[Kib.A] Alert Notification';
          } else {
            message = alerter._source?.config.recoveredMessageTemplate || `✅ Alert recovered: ${alert._source['kibana.alert.rule.name'] || ruleId}`;
            subject = alerter._source?.config.recoveredSubjectTemplate || '[Kib.A] Alert Notification';
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
              try {
                await this.discordService.sendDiscordMessage(
                  channelId,
                  token,
                  message,
                  alert
                );
                this.utilsService.esLoggingHistory(`Discord message sent successfully`, { alerter: { id: alerter._id , name: alerter._source?.name }, rule: { uuid: alert?._source?.['kibana.alert.rule.uuid'], name: alert?._source?.['kibana.alert.rule.name'] } });
              } catch (error) {
                this.utilsService.esLoggingHistory(`Discord message failed to send`, { alerter: { id: alerter._id , name: alerter._source?.name }, rule: { uuid: alert?._source?.['kibana.alert.rule.uuid'], name: alert?._source?.['kibana.alert.rule.name'] } });
              }
              break; // Sortie du switch après envoi Discord
            case 'slack':

              // Slack: token can be encrypted
              console.log("Sending message to Slack channel:", alerter._source?.config.channelName),
                token = alerter._source?.config.token;
              if (this.ENCRYPTION_KEY !== undefined) {
                token = await this.cryptService.decrypt(alerter._source?.config.token, this.ENCRYPTION_KEY);
              }
              try {
                await this.slackService.sendSlackMessage(
                  alerter._source?.config.channelName,
                  token,
                  message,
                  alert
                );
                this.utilsService.esLoggingHistory(`Slack message sent successfully`, { alerter: { id: alerter._id , name: alerter._source?.name }, rule: { uuid: alert?._source?.['kibana.alert.rule.uuid'], name: alert?._source?.['kibana.alert.rule.name'] } });
              } catch (error) {
                this.utilsService.esLoggingHistory(`Slack message failed to send`, { alerter: { id: alerter._id , name: alerter._source?.name }, rule: { uuid: alert?._source?.['kibana.alert.rule.uuid'], name: alert?._source?.['kibana.alert.rule.name'] } });
              }
              break;


            case 'teams':
              payload = alerter._source?.config.payload || '';
              isAdaptiveCard = alerter._source?.config.isAdaptiveCard || false;
              try {
              await this.teamsService.sendTeamsMessage(
                alerter._source?.config.webhook,
                message,
                isAdaptiveCard,
                alert
              );
              this.utilsService.esLoggingHistory(`Teams message sent successfully`, { alerter: { id: alerter._id , name: alerter._source?.name }, rule: { uuid: alert?._source?.['kibana.alert.rule.uuid'], name: alert?._source?.['kibana.alert.rule.name'] } });
              } catch (error) {
                this.utilsService.esLoggingHistory(`Teams message failed to send`, { alerter: { id: alerter._id , name: alerter._source?.name }, rule: { uuid: alert?._source?.['kibana.alert.rule.uuid'], name: alert?._source?.['kibana.alert.rule.name'] } });
              }
              break;
            case 'email':
              // Email: username and password can be encrypted
              username = alerter._source?.config.username;
              password = alerter._source?.config.password;
              if (this.ENCRYPTION_KEY !== undefined) {
                username = await this.cryptService.decrypt(alerter._source?.config.username, this.ENCRYPTION_KEY);
                password = await this.cryptService.decrypt(alerter._source?.config.password, this.ENCRYPTION_KEY);
              }
              try {
                await this.emailService.sendEmailMessage(
                  alerter._source?.config.smtp_server,
                  Number(alerter._source?.config.port),
                  username,
                  password,
                alerter._source?.config.from_address,
                alerter._source?.config.to_addresses.split(",").map((addr: string) => addr.trim()),
                alerter._source?.config.cc_addresses ? alerter._source?.config.cc_addresses.split(",").map((addr: string) => addr.trim()) : [],
                subject || '[Kib.A] Notification',
                message,
                alert
              );
              this.utilsService.esLoggingHistory(`Email message sent successfully`, { alerter: { id: alerter._id , name: alerter._source?.name }, rule: { uuid: alert?._source?.['kibana.alert.rule.uuid'], name: alert?._source?.['kibana.alert.rule.name'] } });
              } catch (error) {
                this.utilsService.esLoggingHistory(`Email message failed to send`, { alerter: { id: alerter._id , name: alerter._source?.name }, rule: { uuid: alert?._source?.['kibana.alert.rule.uuid'], name: alert?._source?.['kibana.alert.rule.name'] } });
              }
              break;
            case 'telegram':

              if (this.ENCRYPTION_KEY !== undefined) {
                token = await this.cryptService.decrypt(alerter._source?.config.token, this.ENCRYPTION_KEY);
                chatId = await this.cryptService.decrypt(alerter._source?.config.chatId, this.ENCRYPTION_KEY);
              }
              try {
                await this.telegramService.sendTelegramMessage(
                  token,
                  chatId,
                  message,
                  alert
                );
                this.utilsService.esLoggingHistory(`Telegram message sent successfully`, { alerter: { id: alerter._id , name: alerter._source?.name }, rule: { uuid: alert?._source?.['kibana.alert.rule.uuid'], name: alert?._source?.['kibana.alert.rule.name'] } });
              } catch (error) {
                this.utilsService.esLoggingHistory(`Telegram message failed to send`, { alerter: { id: alerter._id , name: alerter._source?.name }, rule: { uuid: alert?._source?.['kibana.alert.rule.uuid'], name: alert?._source?.['kibana.alert.rule.name'] } });
              }
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
