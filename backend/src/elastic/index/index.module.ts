import { Module } from '@nestjs/common';
import { IndexService } from './index.service';
import { IndexController } from './index.controller';
import { ElasticsearchService } from 'src/clients/elasticsearch.service';

@Module({
  controllers: [IndexController],
  providers: [IndexService, ElasticsearchService],
  exports: [IndexService],
})
export class IndexModule {}
