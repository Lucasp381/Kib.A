import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { CreateIndexDto } from './dto/create-index.dto';
import { UpdateIndexDto } from './dto/update-index.dto';
import { ElasticsearchService } from 'src/clients/elasticsearch.service';
import { estypes } from '@elastic/elasticsearch';
@Injectable()
export class IndexService {
  private readonly logger = new Logger(IndexService.name);
  constructor(private readonly esService: ElasticsearchService) { }

  create(createIndexDto: CreateIndexDto) {
    return 'This action adds a new index';
  }


  async findAllDocuments(index: string, limit: number = 1000, page: number = 1,  FieldMustExist: string | null = null) {
    let query: estypes.QueryDslQueryContainer;
    if (FieldMustExist) {
      query = {
        bool: {
          must: [
            { match_all: {} },
            { exists: { field: FieldMustExist } }
          ]
        }
      }
    } else {
      query = { match_all: {} }
    }
    const res = await this.esService.search(index, {
      query: query,
      size: limit, // Adjust size as needed
      from: (page - 1) * limit,
    },
       [{ "@timestamp": { order: 'desc' } }]
    );

    if (!res || !res.hits) {
      this.logger.error('Failed to fetch variables');
      throw new HttpException('Failed to fetch variables', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const total = res.hits.total !== undefined
      ? (typeof res.hits.total === 'number' ? res.hits.total : res.hits.total.value)
      : 0;
    return {
      data: res.hits.hits,
      page: Number(page),
      pageSize: Number(limit),
      total: total,
      totalPages: Math.ceil(total / limit)
    };


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
