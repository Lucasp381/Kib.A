import { Controller, Post, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AlertersService } from './alerters.service';

@Controller('alerters/discord')
export class AlertersController {
  private readonly logger = new Logger(AlertersController.name);

  constructor(private readonly alertersService: AlertersService) {}

  @Post('send')
  async sendDiscord(@Body() body: any) {
    const { id, token, message } = body;

    if (!message) {
      throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(`Sending message to Discord channel: ${id}`);

    try {
      return await this.alertersService.sendDiscordMessage(id, token, message);
    } catch (err) {
      throw new HttpException(
        `Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
