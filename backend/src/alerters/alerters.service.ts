import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ElasticsearchService } from 'src/clients/elasticsearch.service';
import { CryptService } from 'src/crypt/crypt.service'
import { CreateAlerterDto } from './dto/create-alerter.dto';



@Injectable()
export class AlertersService {
    constructor(private readonly esService: ElasticsearchService, private readonly cryptService: CryptService) { }

    private readonly logger = new Logger(AlertersService.name);

    async getAlerters(filters: { type?: string; name?: string; id?: string }) {
        const KIBA_INDEX_PREFIX = process.env.KIBA_INDEX_PREFIX || 'kiba';

        const index = KIBA_INDEX_PREFIX + '-alerters';
        const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
        const query: any = {
            size: 1000,
            query: {

            },
            
        };

        if (filters.type) {
            query.query = { term: { type: filters.type } };
        } else if (filters.name) {
            query.query = { term: { name: filters.name } };
        } else if (filters.id) {
            query.query = { term: { _id: filters.id } };
        } else {
            query.query = { match_all: {} };
        }
       
        
        const document = await this.esService.search(index, query, [{ "created_at": { order: 'asc' } }]);

        if (!document) {
            throw new HttpException({ error: 'No documents found' }, HttpStatus.NOT_FOUND);
        }
        if (ENCRYPTION_KEY) {
            await Promise.all(
                (document.hits.hits as any[]).map(async (hit) => {
                    if (!hit._source || !hit._source.config) return;
                    try {
                        switch (hit._source.type) {
                            case 'discord':
                                const discordSource = hit._source;
                                if (discordSource.config.token) {
                                    discordSource.config.token = await this.cryptService.decrypt(discordSource.config.token, ENCRYPTION_KEY);
                                }
                                if (discordSource.config.channelId) {
                                    discordSource.config.channelId = await this.cryptService.decrypt(discordSource.config.channelId, ENCRYPTION_KEY);
                                }
                                break;

                            case 'slack':
                                if (hit._source.config.token) {
                                    hit._source.config.token = await this.cryptService.decrypt(hit._source.config.token, ENCRYPTION_KEY);
                                }
                                if (hit._source.config.channelId) {
                                    hit._source.config.channelId = await this.cryptService.decrypt(hit._source.config.channelId, ENCRYPTION_KEY);
                                }
                                break;
                            case 'email':
                                const source = hit._source;
                                if (source.config.username) {
                                    source.config.username = await this.cryptService.decrypt(source.config.username, ENCRYPTION_KEY);
                                }
                                if (source.config.password) {
                                    source.config.password = await this.cryptService.decrypt(source.config.password, ENCRYPTION_KEY);
                                }
                                break;
                            case 'telegram':
                                const telegramSource = hit._source;
                                if (telegramSource.config.token) {
                                    telegramSource.config.token = await this.cryptService.decrypt(telegramSource.config.token, ENCRYPTION_KEY);
                                }
                                if (telegramSource.config.chatId) {
                                    telegramSource.config.chatId = await this.cryptService.decrypt(telegramSource.config.chatId, ENCRYPTION_KEY);
                                }
                                break;
                        }
                    } catch (err) {
                        console.error('Error decrypting document:', err);
                    }
                }),
            );
        }

        const data = document.hits.hits
            .map((hit: any) => {
                if (!hit._source) return null;
                return {
                    id: hit._id,
                    ...hit._source,
                };
            })
            .filter(Boolean);

        if (data.length === 0) {
            throw new HttpException({ error: 'No documents found' }, HttpStatus.NOT_FOUND);
        }
        if (data.length === 1 && filters.id) {
            return data[0];
        }
        return data;
    }

    async createOrUpdate(body: CreateAlerterDto) {

        const { id, name, type, description, enabled, config, all_rules, rules, created_at, updated_at } = body;
        const KIBA_INDEX_PREFIX = process.env.KIBA_INDEX_PREFIX || 'kiba';
        this.logger.log(`Creating or updating alerter: ${JSON.stringify(body)}`);

        const index = KIBA_INDEX_PREFIX + '-alerters';
        if (!type || !config) {
            throw new HttpException(
                { error: 'Missing name, type or config parameter' },
                HttpStatus.BAD_REQUEST,
            );
        }
        try {
            
        if (process.env.ENCRYPTION_KEY) {
            switch (type) {
                case 'discord':
                    if (config.token) config.token = await this.cryptService.encrypt(config.token, process.env.ENCRYPTION_KEY);
                    if (config.channelId) config.channelId = await this.cryptService.encrypt(config.channelId, process.env.ENCRYPTION_KEY);
                    break;
                case 'slack':
                    if (config.token) config.token = await this.cryptService.encrypt(config.token, process.env.ENCRYPTION_KEY);
                    if (config.channelId) config.channelId = await this.cryptService.encrypt(config.channelId, process.env.ENCRYPTION_KEY);
                    break;
                case 'email':
                    if (config.username) config.username = await this.cryptService.encrypt(config.username, process.env.ENCRYPTION_KEY);
                    if (config.password) config.password = await this.cryptService.encrypt(config.password, process.env.ENCRYPTION_KEY);
                    break;
                case 'telegram':
                    if (config.token) config.token = await this.cryptService.encrypt(config.token, process.env.ENCRYPTION_KEY);
                    if (config.chatId) config.chatId = await this.cryptService.encrypt(config.chatId, process.env.ENCRYPTION_KEY);
                    break;
            }
        }

        } catch (err) {
            this.logger.error('Error encrypting alerter config:', err);
        }
        
        const query = {
            name: decodeURIComponent(name),
            type,
            enabled: enabled || false,
            description: description || '',
            config,
            '@timestamp': new Date().toISOString(),
            all_rules,
            rules: rules || [],
            created_at: created_at,
            updated_at: updated_at || new Date().toISOString(),

        };
        this.logger.log(`Indexing alerter: ${JSON.stringify(query)}`);
        return this.esService.index(index, query, id);
    }

    async delete(id: string) {
        const KIBA_INDEX_PREFIX = process.env.KIBA_INDEX_PREFIX || 'kiba';

        const index = KIBA_INDEX_PREFIX + '-alerters';
        return this.esService.delete(index, id);
    }
    async duplicate(originalId: string) {
        const KIBA_INDEX_PREFIX = process.env.KIBA_INDEX_PREFIX || 'kiba';

        const index = KIBA_INDEX_PREFIX + '-alerters';
        const originalAlerter = await this.getAlerters({ id: originalId });

        if (!originalAlerter) {
            throw new HttpException(
                { error: 'Original alerter not found' },
                HttpStatus.NOT_FOUND,
            );
        }

        // Remove the ID to create a new one
        delete originalAlerter.id;
        originalAlerter.created_at = new Date().toISOString();
        originalAlerter.enabled = false; // Disable the duplicated alerter by default

        const res = await this.createOrUpdate(originalAlerter);
        const data = await res;
        if (data) {
            const duplicatedAlerter = await this.getAlerters({ id: data._id });
            return duplicatedAlerter;
        }
        throw new HttpException(
            { error: 'Failed to duplicate alerter' },
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
    }
