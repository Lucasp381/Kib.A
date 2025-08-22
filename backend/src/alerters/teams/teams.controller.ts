import { Controller, Post, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { TeamsService } from './teams.service';

@Controller('alerters/teams')
export class TeamsController {
  private readonly logger = new Logger(TeamsController.name);

  constructor(private readonly teamsService: TeamsService) {}

  @Post('send')
  async sendTeams(@Body() body: any) {
    const { webhook, message, isAdaptiveCard } = body;

    if (!message) {
      throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
    }


    try {
      return await this.teamsService.sendTeamsMessage(webhook, message, isAdaptiveCard);
    } catch (err) {
      throw new HttpException(
        `Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
