import { Injectable , HttpException, HttpStatus, Logger} from '@nestjs/common';
import { UtilsService } from 'src/utils/utils.service';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  constructor(private readonly utilsService: UtilsService) {}
  
  async sendTelegramMessage(
  token: string,
  chatId: string,
  message?: string,
  alert?: any
) {
    this.logger.log(`Sending Telegram message to chat ID ${chatId}`);
    try{
      if (!token) {
        throw new Error('Telegram bot token is required');
      }
      if (!chatId) {
        throw new Error('Chat ID is required');
      }
      if (!message) {
        throw new Error('Message is required');
      }
      let body = "";
      if (alert) {
        body = await this.utilsService.replacePlaceholders(message, alert);
      }else{
        body = message;
      }
      const validToken = /^[0-9]{10}:[A-Za-z0-9_-]{35}/;
      if (!token.match(validToken)) {
        throw new Error('Invalid Telegram bot token format');
      }
      const validChatId = /^-?\d+$/;

      if (!chatId.toString().match(validChatId)) {
        throw new Error('Invalid Chat ID format');
      }


      const response = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: body,
          parse_mode: "HTML"
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error(`Telegram API error: ${errorData.description || response.statusText}`);
        throw new Error(`Telegram API error: ${errorData.description || response.statusText}`);
      }
      this.logger.log(`Message sent to Telegram chat ID ${chatId} successfully.`);
      return response;
    } catch (err) {
      this.logger.error(`Failed to send Telegram message: ${err.message}`);
      throw new HttpException(`Failed to send Telegram message: ${err.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

