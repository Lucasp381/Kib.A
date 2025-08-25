import { NextRequest, NextResponse } from 'next/server';
import { esClient, getKeyValue, setKeyValue } from '@/lib/elasticsearch';
import { estypes } from '@elastic/elasticsearch'

const KIBA_INDEX_PREFIX = process.env.KIBA_INDEX_PREFIX || 'kiba';
type Variable = {
    id: string;
    data: string;
    "@timestamp": string;
};

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (!key) {
        const document = await esClient.search({
            index: KIBA_INDEX_PREFIX + '-variables',
            query: {              
                    match_all: {}
            }
        });
        if (!document) {
            return NextResponse.json({ error: 'No documents found' }, { status: 404 });
        }
        const data = (document.hits.hits as estypes.SearchHit<Variable>[])
            .map((hit) => {
                if (!hit._source) return null;
                return {
                    id: hit._id,
                    data: hit._source.data,
                    timestamp: hit._source["@timestamp"]
                };
            })
            .filter((item): item is { id: string; data: string; timestamp: string } => item !== null);
        return NextResponse.json(data);
    }
    try {
        const document = await getKeyValue(KIBA_INDEX_PREFIX + '-variables', key);
        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }
        return NextResponse.json(document);
    } catch (error) {
        console.error('Error fetching document:', error);
        return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
    }
}
export async function POST(req: NextRequest) {

    const body = await req.json();
    const { key, value } = body;

    if (!key || !value) {
        return NextResponse.json({ error: 'Missing key or value parameter' }, { status: 400 });
    }
    try {
        await setKeyValue(KIBA_INDEX_PREFIX + '-variables', key, JSON.stringify({data: value, "@timestamp": new Date().toISOString()}));
        return NextResponse.json({ message: 'Document created/updated successfully' });
    } catch (error) {
        console.error('Error creating/updating document:', error);
        return NextResponse.json({ error: 'Failed to create/update document' }, { status: 500 });
    }

}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (!key) {
        return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
    }
    try {
        const response = await esClient.delete({
            index: KIBA_INDEX_PREFIX + '-variables',
            id: key,
        });
        return NextResponse.json({ message: 'Document deleted successfully', response });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }
}