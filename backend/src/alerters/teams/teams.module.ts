import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { UtilsService } from 'src/utils/utils.service';

@Module({
  providers: [TeamsService, UtilsService],
  controllers: [TeamsController],
  exports: [TeamsService]
})
export class TeamsModule {}
