import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { CreateIndexDto } from './dto/create-index.dto';
import { UpdateIndexDto } from './dto/update-index.dto';
import { ElasticsearchService } from 'src/clients/elasticsearch.service';

@Injectable()
export class IndexService {
  private readonly logger = new Logger(IndexService.name);
  constructor(private readonly esService: ElasticsearchService) { }

  create(createIndexDto: CreateIndexDto) {
    return 'This action adds a new index';
  }


  async findAllDocuments(index: string, limit: number = 1000, page: number = 1) {

    const res = await this.esService.search(index, {
      query: {
        match_all: {},
        },
      sort: {
        "@timestamp": {
          order: 'desc',
        },
      },
      size: limit, // Adjust size as needed
      from: (page - 1) * limit,
     
    },);

    if (!res || !res.hits) {
      this.logger.error('Failed to fetch variables');
      throw new HttpException('Failed to fetch variables', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return res.hits.hits;


  }

  findOne(id: number) {
    return `This action returns a #${id} index`;
  }

  update(id: number, updateIndexDto: UpdateIndexDto) {
    return `This action updates a #${id} index`;
  }

  remove(id: number) {
    return `This action removes a #${id} index`;
  }
}
