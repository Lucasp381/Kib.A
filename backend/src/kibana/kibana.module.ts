import { KibanaService } from './kibana.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
    imports: [],
    controllers: [],
    providers: [
        KibanaService,],
})
export class KibanaModule { }
