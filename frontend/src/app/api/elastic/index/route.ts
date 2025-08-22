import { NextResponse } from 'next/server';
import { esClient } from '@/lib/elasticsearch';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const index = searchParams.get('index');
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const FieldMustExist = searchParams.get('FieldMustExist');

  if (!index) {
    return NextResponse.json({ error: 'Missing index parameter' }, { status: 400 });
  }

  try {
    let query
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
    const response = await esClient.search({
      index,
      from: (page - 1) * limit,
      size: limit,
      query,
    });
    
    const totalHits =
      typeof response.hits.total === 'number' ? response.hits.total : response.hits.total?.value;

      if(!totalHits) {
        return NextResponse.json({ data: [], total: 0, page, pageSize: limit, totalPages: 0 });
      }
    return NextResponse.json({
      data: response.hits.hits,
      total: totalHits,
      page,
      pageSize: limit,
      totalPages: Math.ceil(totalHits / limit),
    });
  } catch (error) {
    console.error('Error fetching data from Elasticsearch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Elasticsearch' },
      { status: 500 },
    );
  }
}
