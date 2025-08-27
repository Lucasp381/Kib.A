

import { Module } from '@nestjs/common';
import { AlertersService } from './alerters.service';
import { AlertersController } from './alerters.controller';

import { CryptModule } from 'src/crypt/crypt.module';
import { ElasticsearchModule } from 'src/clients/elasticsearch.module';


@Module({
    imports: [CryptModule, ElasticsearchModule],
    controllers: [AlertersController],
    providers: [AlertersService],
    exports: [AlertersService]
})
export class AlertersModule { }
