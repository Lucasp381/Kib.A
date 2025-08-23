
import { NextResponse } from 'next/server';
import { esClient } from '@/lib/elasticsearch';
import { format } from 'path';



export async function GET() {
  try {
    const response = await esClient.cat.health({ format: 'json' });
    console.log("Elasticsearch health:", response);
    if (!response || response.length === 0) {
      return Response.json({ error: 'No Elasticsearch health data found' }, { status: 404 });
    }
    return Response.json(response[0]);
  } catch (error) {
    console.error('Error fetching Elasticsearch health:', error);
    return Response.json({ error: 'Failed to fetch Elasticsearch health' }, { status: 500 });
  }
}