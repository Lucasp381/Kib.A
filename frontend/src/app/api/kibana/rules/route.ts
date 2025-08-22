import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const kibanaUrl = process.env.KIBANA_URL || 'http://127.0.0.1:5601';
    const apiKey = process.env.ELASTIC_API_KEY;
    const res = await fetch(`${kibanaUrl}/api/alerting/rules/_find?per_page=${limit}&page=${page}`, {
        method: 'GET',
        headers: {

            'Authorization': `ApiKey ${apiKey}`
        }
    }
    );
    if (!res.ok) {
        console.error('Error fetching rules:', res);
        return NextResponse.json({ error: 'Failed to fetch rules' }, { status: res.status });

    }
    const data = await res.json();
    const totalHits =
      typeof data.total === 'number' ? data.total : data.total?.value;

      if(!totalHits) {
        return NextResponse.json({ data: [], total: 0, page, pageSize: limit, totalPages: 0 });
      }
    return NextResponse.json({ data: data.data, total: totalHits, page, pageSize: limit, totalPages: Math.ceil(totalHits / limit) });
  } catch (error) {
    console.error('Error fetching rules:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
