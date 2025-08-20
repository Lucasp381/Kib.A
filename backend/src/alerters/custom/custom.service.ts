import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CustomService {
  private readonly logger = new Logger(CustomService.name);

  async sendCustomMessage(target: string, token: string, message: string) {
    this.logger.log("\Sending message to Custom: \\");
    // TODO: Implémenter l'appel API vers Custom
    return { success: true, data: { target, message } };
  }
}
