import { Module } from '@nestjs/common';
import { AlertersService } from './alerters.service';
import { AlertersController } from './alerters.controller';

@Module({
  providers: [AlertersService],
  controllers: [AlertersController]
})
export class AlertersModule {}
