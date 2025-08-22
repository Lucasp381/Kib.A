import { NextRequest, NextResponse } from 'next/server';
import { estypes } from '@elastic/elasticsearch'
import { esClient} from '@/lib/elasticsearch';
import { encrypt, decrypt } from '@/lib/crypt';
import { Alerter, EmailAlerter } from '@/types/alerters';
const KIBALERT_INDEX_PREFIX = process.env.KIBALERT_INDEX_PREFIX || 'kiba';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const name = searchParams.get('name');
    const id = searchParams.get('id');
    try {
    const query = {
        index: KIBALERT_INDEX_PREFIX + '-alerters',
        query : {}
    }
    if (type) {
        query.query = {
            ...query.query,
            term: { type: type },
            
    };
    }
    if (name) {
        query.query = {
            ...query.query,
            term: { name: name },
            
    };
    }
    if (id) {
        query.query = {
            ...query.query,
            term: { _id: id },
            
    };
    }
    if (!type && !name && !id) {
        query.query = {
            match_all: {}
        };
    }
    

    const document = await esClient.search(query);
    if (!document) {
        return NextResponse.json({ error: 'No documents found' }, { status: 404 });
    }
    if (process.env.ENCRYPTION_KEY) {
        
        await Promise.all((document.hits.hits as estypes.SearchHit<Alerter>[]).map(async (hit: estypes.SearchHit<Alerter>) => {
            try {
            if (!hit._source || !(hit._source).config ) return;
            if (!hit._source.config) return;
            switch (hit._source.type) {

                case 'discord':
                    if (process.env.ENCRYPTION_KEY && hit._source.config.token && hit._source.config.token !== '') {
                        hit._source.config.token = await decrypt(hit._source.config.token, process.env.ENCRYPTION_KEY);
                    }
                    if (process.env.ENCRYPTION_KEY && hit._source.config.channelId && hit._source.config.channelId !== '') {
                        hit._source.config.channelId = await decrypt(hit._source.config.channelId, process.env.ENCRYPTION_KEY);
                    }
                    break;
                case 'slack':
                    if (process.env.ENCRYPTION_KEY && hit._source.config.token && hit._source.config.token !== '') {
                        hit._source.config.token = await decrypt(hit._source.config.token, process.env.ENCRYPTION_KEY);
                    }
                    if (process.env.ENCRYPTION_KEY && hit._source.config.channelId && hit._source.config.channelId !== '') {
                        hit._source.config.channelId = await decrypt(hit._source.config.channelId, process.env.ENCRYPTION_KEY);
                    }
                    break;
                case 'email':
                    const source = hit._source as EmailAlerter;
                    if (process.env.ENCRYPTION_KEY && hit._source.config.smtp_server && hit._source.config.smtp_server !== '') {
                        hit._source.config.username = await decrypt(source.config.username, process.env.ENCRYPTION_KEY);
                    }   
                    if (process.env.ENCRYPTION_KEY && source.config.password ) {
                        source.config.password = await decrypt(source.config.password, process.env.ENCRYPTION_KEY);
                    }
                    break;
                default:
                    break;
            }
            } catch (error) {
                console.error('Error decrypting document:', error);
            }
        }));

    }
      

     
    const data = document.hits.hits.map((hit) => {
        const typedHit = hit as estypes.SearchHit<Alerter>;
        if (!typedHit._source) {
            return null;
        }
        return {
            id: typedHit._id,
            name: typedHit._source.name,
            type: typedHit._source.type,
            enabled: typedHit._source.enabled,
            description: typedHit._source.description,
            config: typedHit._source.config,
            all_rules: typedHit._source.all_rules || false,
            rules: typedHit._source.rules || [],
            created_at: typedHit._source.created_at || undefined,
            updated_at: typedHit._source.updated_at || undefined
        };
    }).filter((item) => item !== null);
    data.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
    if (data.length === 0) {
        return NextResponse.json({ error: 'No documents found' }, { status: 404 });
    }
    if (data.length === 1 && id) {
        // If we are fetching by ID, return the single document directly
        return NextResponse.json(data[0]);
    }
    return NextResponse.json(data);
    
    
       
    } catch (error) {
        console.error('Error fetching document:', error);
        return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
    }
}
export async function POST(req: NextRequest) {

    const body = await req.json();
    const {id, name, type, description, enabled, config, all_rules, rules, created_at, updated_at } = body;
    if( process.env.ENCRYPTION_KEY) {
        switch (type) {
            case 'discord':
                if (config.token) {
                    
                        config.token = await encrypt(config.token, process.env.ENCRYPTION_KEY);
                }
                if (config.channelId) {
                    
                        config.channelId = await encrypt(config.channelId, process.env.ENCRYPTION_KEY);
                    
                }
                break;
            case 'slack':
                if (config.token) {
                        config.token = await encrypt(config.token, process.env.ENCRYPTION_KEY);
                }
                if (config.channelId) {
                        config.channelId = await encrypt(config.channelId, process.env.ENCRYPTION_KEY);
                }
                break;
            case 'email':
                if (config.username) {
                        config.username = await encrypt(config.username, process.env.ENCRYPTION_KEY);
                }
                if (config.password) {
                        config.password = await encrypt(config.password, process.env.ENCRYPTION_KEY);
                }
                break;
        }
    }
    const query = {
        index: KIBALERT_INDEX_PREFIX + '-alerters',
        id : id || undefined, // si id est fourni, on l'utilise, sinon on laisse undefined pour créer un nouveau document
        document: {
            name: decodeURIComponent(name),
            type: type,
            enabled: enabled || false,
            description: description || '',
            config: config,
            '@timestamp': new Date().toISOString(),
            all_rules: all_rules,
            rules: rules || [],
            created_at: created_at ,
            updated_at: updated_at || new Date().toISOString()
        }
    }
    if ( !type || !config ) {
        return NextResponse.json({ error: 'Missing name, type or config parameter' }, { status: 400 });
    }

  
    try {
        const response = await esClient.index(query);
        return NextResponse.json({ message: 'Document created/updated successfully', response });
    } catch (error) {
        console.error('Error creating/updating document:', error);
        return NextResponse.json({ error: 'Failed to create/update document' }, { status: 500 });
    }

}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Missing name parameter' }, { status: 400 });
    }
    try {
        const response = await esClient.delete({
            index: KIBALERT_INDEX_PREFIX + '-alerters',
            id: id,
        });


       
        
        return NextResponse.json({ message: 'Document deleted successfully', response });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }
}