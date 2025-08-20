import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { UtilsService } from '../../utils/utils.service';

@Module({
  controllers: [EmailController],
  providers: [EmailService, UtilsService],
  exports: [EmailService],
})
export class EmailModule {}
