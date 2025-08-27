import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';


@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private client: Client;
  private readonly logger = new Logger(ElasticsearchService.name);

  onModuleInit() {
    let esClientConfiguration: {
  node: string;
  auth: { apiKey: string };
  tls: { rejectUnauthorized: boolean };
  caFingerprint?: string;
} = {
  node: process.env.ELASTIC_URL || 'http://127.0.0.1:9200',
  auth: {
    apiKey: process.env.ELASTIC_API_KEY || ''
  },
  tls: {
    rejectUnauthorized: process.env.ELASTIC_TLS_REJECT_UNAUTHORIZED === 'true'
  }
};
if (process.env.ELASTIC_CA_FINGERPRINT && process.env.ELASTIC_CA_FINGERPRINT.length > 0) {
  esClientConfiguration.caFingerprint = process.env.ELASTIC_CA_FINGERPRINT;
}

    this.client = new Client(esClientConfiguration);
  }

  getClient(): Client {
    return this.client;
  }

  async index( index: string, body: any, id?: string,) {
      type indexResult = {
        _id: string;
        _index: string;
        _version: number;
        result: string;
      };
    try {

      const result = await this.client.index({
        id: id || undefined,
        index,
        body,
        refresh: true, // Ensure the document is searchable immediately
      });
      this.logger.log(`Indexed document with id: ${JSON.stringify(result)} in index: ${index}`);
      return result as indexResult;

    } catch (error) {
      this.logger.error(`Error indexing document in index: ${index}`, error);
      return null;
    }
  }

  async search(index: string, query: any, sort?: any) {
    return this.client.search({
      index,
      sort: sort,
      body: query,
    });
  }
    async delete(index: string, id: string) {
      this.logger.log(`Deleting document with id: ${id} from index: ${index}`);
        return this.client.delete({
        index,
        id,
        refresh: true, // Ensure the document is searchable immediately
        });
    }
}