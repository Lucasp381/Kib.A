import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { DiscordController } from './discord.controller';
import { UtilsService } from '../../utils/utils.service';

@Module({
  controllers: [DiscordController],
  providers: [DiscordService, UtilsService],
  exports: [DiscordService],
})
export class DiscordModule {}
