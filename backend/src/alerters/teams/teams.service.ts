import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  async sendTeamsMessage(target: string, token: string, message: string) {
    this.logger.log("\Sending message to Teams: \\");
    // TODO: Implémenter l'appel API vers Teams
    return { success: true, data: { target, message } };
  }
}
