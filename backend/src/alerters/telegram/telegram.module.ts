import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { UtilsService } from 'src/utils/utils.service';

@Module({
  controllers: [TelegramController],
  providers: [TelegramService, UtilsService],
  exports: [TelegramService],
})
export class TelegramModule {}
