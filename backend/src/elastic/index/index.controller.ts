import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { IndexService } from './index.service';
import { CreateIndexDto } from './dto/create-index.dto';
import { UpdateIndexDto } from './dto/update-index.dto';

@Controller('elastic/index')
export class IndexController {
  constructor(private readonly indexService: IndexService) {}

  @Post()
  create(@Body() createIndexDto: CreateIndexDto) {
    return this.indexService.create(createIndexDto);
  }

  @Get('history')
  async findAllHistory(@Query('limit') limit: number = 1000, @Query('page') page: number) {
    const index = process.env.KIBA_INDEX_PREFIX + '-history' || 'kiba-history';
    return this.indexService.findAllDocuments(index, limit, page);
  }
  @Get('alerts')
  async findAllAlerts(@Query('limit') limit: number = 1000, @Query('page') page: number) {
    const index = '*alerts-*' ;
    return this.indexService.findAllDocuments(index, limit, page);
  }

  @Get('documents')
  async findAllDocuments(@Query('index') index: string, @Query('limit') limit: number, @Query('page') page: number) {
    return this.indexService.findAllDocuments(index, limit, page);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.indexService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIndexDto: UpdateIndexDto) {
    return this.indexService.update(+id, updateIndexDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.indexService.remove(+id);
  }
}

