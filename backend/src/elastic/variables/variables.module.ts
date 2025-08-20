import { Module } from '@nestjs/common';
import { VariablesService } from './variables.service';
import { VariablesController } from './variables.controller';
import { ElasticsearchModule } from 'src/clients/elasticsearch.module';


@Module({
  imports: [ElasticsearchModule],
  controllers: [VariablesController],
  providers: [VariablesService],
})
export class VariablesModule {}
