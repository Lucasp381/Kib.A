import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CreateVariableDto } from './dto/create-variable.dto';
import { UpdateVariableDto } from './dto/update-variable.dto';
import { ElasticsearchService } from 'src/clients/elasticsearch.service';

@Injectable()
export class VariablesService {
  private readonly logger = new Logger(VariablesService.name);

  constructor(private readonly esService: ElasticsearchService) {}
  
  create(createVariableDto: CreateVariableDto) {
    this.logger.log(`Creating variable with data: ${JSON.stringify(createVariableDto)}`);
    const index = 'variables';
    this.esService.index(index, createVariableDto);
    return 'This action adds a new variable';
  }

  async findAll() {
    this.logger.log('Fetching all variables');
    const index = `${process.env.KIBALERT_INDEX_PREFIX}-variables`;
   const res = await this.esService.search(index, {
      query: {
        match_all: {},
      },
    });

    if (!res || !res.hits) {
      this.logger.error('Failed to fetch variables');
      throw new HttpException('Failed to fetch variables', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return res.hits.hits;

    
    
    
  }

  async findOne(id: string) {
    this.logger.log(`Fetching variable with id: ${id}`);

    const index = `${process.env.KIBALERT_INDEX_PREFIX}-variables`;
    const res = await this.esService.search(index, {
      query: {
        term: { _id: id },
      },
    })
    if (!res || !res.hits) {
      this.logger.error('Failed to fetch variables');
      throw new HttpException('Failed to fetch variables', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return res.hits.hits;

  }

  update(id: string, updateVariableDto: UpdateVariableDto) {
    this.logger.log(`Updating variable #${id} with data: ${JSON.stringify(updateVariableDto)}`);
    const index = `${process.env.KIBALERT_INDEX_PREFIX}-variables`;
    this.esService.index(index, {
      ...updateVariableDto,
      _id: id,
    });
    return `This action updates a #${id} variable`;
  }

  remove(id: string) {
    this.logger.log(`Removing variable with id: ${id}`);
    const index = `${process.env.KIBALERT_INDEX_PREFIX}-variables`;

    this.esService.delete(index, id);

    this.logger.log(`Variable with id ${id} removed successfully`);
  }
}
