import { NextResponse } from 'next/server';
import { Rule } from '@/types/rules';
import { useElasticKV } from '@/hooks/useElasticKV';
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const KIBANA_URL = process.env.KIBANA_URL || 'http://127.0.0.1:5601';
   
    const id = searchParams.get('id');
    const apiKey = process.env.ELASTIC_API_KEY;
    const res = await fetch(`${KIBANA_URL}/api/alerting/rule_types`, {
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
    if(id){
        const rule = data.find((rule: Rule) => rule.id === id);
        if (!rule) {
            return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
        }
        return NextResponse.json(rule);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching rules:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
