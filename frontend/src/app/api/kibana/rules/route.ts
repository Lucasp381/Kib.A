import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const kibanaUrl = process.env.KIBANA_URL || 'http://127.0.0.1:5601';
    const apiKey = process.env.ELASTIC_API_KEY;
    const res = await fetch(`${kibanaUrl}/api/alerting/rules/_find?per_page=10000`, {
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

    return NextResponse.json(data.data);
  } catch (error) {
    console.error('Error fetching rules:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
