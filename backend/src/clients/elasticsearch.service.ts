import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private client: Client;

  onModuleInit() {
    this.client = new Client({
        node: process.env.ELASTIC_URL || 'http://127.0.0.1:9200',
        auth: {
          apiKey: process.env.ELASTIC_API_KEY || ''
      
        },
    });
  }

  getClient(): Client {
    return this.client;
  }

  async index(index: string, body: any) {
    return this.client.index({
      index,
      body,
    });
  }

  async search(index: string, query: any) {
    return this.client.search({
      index,
      body: query,
    });
  }
    async delete(index: string, id: string) {
        return this.client.delete({
        index,
        id,
        });
    }
}