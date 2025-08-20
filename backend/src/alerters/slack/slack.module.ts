import { Module } from '@nestjs/common';
import { SlackService } from './slack.service';
import { SlackController } from './slack.controller';
import { UtilsService } from '../../utils/utils.service';

@Module({
  controllers: [SlackController],
  providers: [SlackService , UtilsService],
  exports: [SlackService],
})
export class SlackModule {}
