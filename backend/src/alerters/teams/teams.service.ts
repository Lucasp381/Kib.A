import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { UtilsService } from '../../utils/utils.service';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);
  constructor(private readonly utilsService: UtilsService) {}

  async sendTeamsMessage(
  webhook: string,
  message?: string,
  isAdaptiveCard?: boolean,
  alert?: any
) {
  if (!webhook) {
    throw new HttpException('Webhook URL is required', HttpStatus.BAD_REQUEST);
  }
  if (!message) {
    throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
  }
  const webhookUrlPattern = /^https:\/\/(?:outlook\.office\.com|[a-zA-Z0-9.-]+\.webhook\.office\.com)\/webhookb?2?\/[0-9a-fA-F-]+@[0-9a-fA-F-]+\/IncomingWebhook\/[0-9a-fA-F-]+\/[0-9a-fA-F-]+(?:\/[0-9a-zA-Z-_]+)$/;

  if (!webhookUrlPattern.test(webhook)) {
   
    throw new HttpException('Invalid Webhook URL', HttpStatus.BAD_REQUEST);
  }

  let body: any;
  // Validate Webhook URL
 

  // Fonction récursive pour remplacer les placeholders dans toutes les chaînes
  const replacePlaceholdersInObject = (obj: any, data: any): any => {
    if (typeof obj === 'string') {
      return obj.replace(/{([^}]+)}/g, (_, rawPath) => {
        const v = this.utilsService.getValue(data, rawPath);
        if (v === undefined || v === null) return `{${rawPath}}`;
        return typeof v === 'object' ? JSON.stringify(v) : String(v);
      });
    } else if (Array.isArray(obj)) {
      return obj.map(item => replacePlaceholdersInObject(item, data));
    } else if (typeof obj === 'object' && obj !== null) {
      const result: any = {};
      for (const key of Object.keys(obj)) {
        result[key] = replacePlaceholdersInObject(obj[key], data);
      }
      return result;
    }
    return obj;
  };

  if (isAdaptiveCard) {
    this.logger.log(`Sending Adaptive Card to Teams: ${webhook}`);
    
    // message doit être un objet JSON de type AdaptiveCard
    let payload: any;
    try {
      payload = typeof message === 'string' ? JSON.parse(message) : message;
    } catch {
      throw new HttpException('Invalid JSON string for Adaptive Card', HttpStatus.BAD_REQUEST);
    }


    // remplacement récursif des placeholders
    body = replacePlaceholdersInObject(payload, alert);


  } else {
    // message simple
    const replacedMessage = await this.utilsService.replacePlaceholders(message, alert);

    body = {
      type: "message",
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: {
            type: "AdaptiveCard",
            body: [
              {
                type: "TextBlock",
                text: replacedMessage
              }
            ],
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            version: "1.0"
          }
        }
      ]
    };
  }

  try {
    const teamsRes = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await teamsRes.text();
    this.logger.log(`✅ Teams API response: ${data}`);

    if (!teamsRes.ok) {
      throw new HttpException(`Teams API error: ${data}`, teamsRes.status as HttpStatus);
    }

    this.logger.log(`✅ Teams message sent successfully`);
    return { success: true, data };

  } catch (error) {
    this.logger.error(`❌ Failed to send Teams message: ${error.message}`);
    throw new HttpException(`Failed to send Teams message: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

}
