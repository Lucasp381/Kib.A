import { Module } from '@nestjs/common';
import { CustomService } from './custom.service';
import { CustomController } from './custom.controller';

@Module({
  controllers: [CustomController],
  providers: [CustomService],
  exports: [CustomService],
})
export class CustomModule {}
