import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';


@Injectable()
export class AlertersService {
  private readonly logger = new Logger(AlertersService.name);

  async sendDiscordMessage(id: string, token: string, message: string) {
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
