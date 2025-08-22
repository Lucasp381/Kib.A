import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { UtilsService } from '../../utils/utils.service';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);
  constructor(private readonly utilsService: UtilsService) {}

  async sendDiscordMessage(id: string, token: string, message: string, alert?: any) {
    
    
    this.logger.log(`Sending Discord message to channel ID: ${id}`);
    if(alert) {
      message = await this.utilsService.replacePlaceholders(message, alert);
    }
    const idPattern = /^\d{10,20}$/;
    if (!idPattern.test(id)) {
      throw new HttpException('Invalid Discord channel ID', HttpStatus.BAD_REQUEST);
    }
    const discordRes = await fetch(`https://discord.com/api/v10/channels/${id}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: message }),
    });

    if (!discordRes.ok) {
      const errorText = await discordRes.text();
      throw new HttpException(
        `Discord API error: ${errorText}`,
        discordRes.status as HttpStatus
      );
    }

    const data = await discordRes.json();
    this.logger.log(`Discord message sent successfully`);
    return { success: true, data };
  }
}
