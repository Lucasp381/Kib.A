// discord.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DiscordService } from './discord.service';
import { DiscordController } from './discord.controller';

@Module({
  imports: [HttpModule],
  providers: [DiscordService],
  controllers: [DiscordController],
  exports: [DiscordService], 
})
export class DiscordModule {}
