import { Controller, Get, Headers, Param } from '@nestjs/common';
import { DiscordService } from './discord.service';

@Controller('discord')
export class DiscordController {
  constructor(private readonly discordService: DiscordService) {}

  @Get('me')
  async getBotInfo(@Headers('authorization') authHeader: string) {
    // authHeader contient la valeur du header 'Authorization'
    return this.discordService.getCurrentBotInfo(authHeader);
  }

  @Get('user/:id')
  async getUser(
    @Param('id') userId: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.discordService.getUserById(userId, authHeader);
  }

  @Get('channel/:id')
  async getChannel(
    @Param('id') channelId: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.discordService.getChannelById(channelId, authHeader);
  }
}
