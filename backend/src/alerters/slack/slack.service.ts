import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { UtilsService } from '../../utils/utils.service';

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  constructor(private readonly utilsService: UtilsService) {}

  async sendSlackMessage(name: string, token: string, message: string, alert?: any) {
    this.logger.debug(`Sending Slack message to channel: ${name} `);

    message = await this.utilsService.replacePlaceholders(message, alert);


    const slackRes = await fetch(`https://slack.com/api/conversations.list`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!slackRes.ok) {
      const errorText = await slackRes.text();
      return errorText
    }

    
    const data = await slackRes.json();
    const channel = data.channels.find((channel: any) => channel.name === name);




    try {
      console.log("Sending message to Slack channel:", channel.id);
      const slackRes = await fetch(
        `https://slack.com/api/chat.postMessage`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json; charset=utf-8",

          },
          body: JSON.stringify({ channel: channel.id, text: message }),
        }
      );
      console.log("Slack response status:", slackRes.status);
      if (!slackRes.ok) {
        const errorText = await slackRes.text();
        return errorText
      }

      const data = await slackRes.json();
      return data;
    } catch (err) {
      return err instanceof Error ? err.message : "Unknown error";
    }
  }
}