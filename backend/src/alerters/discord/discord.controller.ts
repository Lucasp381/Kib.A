import { Controller, Post, Body, HttpException, HttpStatus , Logger } from '@nestjs/common';
import { DiscordService } from './discord.service';

@Controller('alerters/discord')
export class DiscordController {
private readonly logger = new Logger(DiscordController.name);

  constructor(private readonly alertersService: DiscordService) {}

  @Post('send')
  async sendDiscord(@Body() body: any) {
    const { id, token, message } = body;

    if (!message) {
      throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(`Sending message to Discord channel: ${id} with token: ${token} and message: ${message}`);

    try {
      return await this.alertersService.sendDiscordMessage(id, token, message, body.alert);
    } catch (err) {
      throw new HttpException(
        `Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
