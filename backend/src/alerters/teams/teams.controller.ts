import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { TeamsService } from './teams.service';

@Controller('alerters/teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post('send')
  async send(@Body() body: any) {
    const { target, token, message } = body;
    if (!message) {
      throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
    }
    return this.teamsService.sendTeamsMessage(target, token, message);
  }
}
