import { Controller, Post, Body,Logger, HttpException, HttpStatus } from '@nestjs/common';
import { TelegramService } from './telegram.service';


@Controller('alerters/telegram')
export class TelegramController {
    private readonly logger = new Logger(TelegramController.name);

    constructor(private readonly telegramService: TelegramService) {}

    @Post('send')
    async sendTelegram(@Body() body: any) {
      const { token, chatId, message } = body;

      if (!message) {
        throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
      }
  
  
      try {
        return await this.telegramService.sendTelegramMessage(token, chatId, message);
      } catch (err) {
        throw new HttpException(
          `Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
}
