import { NextRequest, NextResponse } from "next/server";



export async function GET(
  req: NextRequest

) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  const kibanaUrl = process.env.KIBANA_URL || 'http://127.0.0.1:5601';
  const apiKey = process.env.ELASTIC_API_KEY;
  if(!apiKey){
    return NextResponse.json({ error: 'API key is required' }, { status: 400 });
  }
  try {
    // Appel à l'API Kibana pour récupérer les détails de la règle
    const res = await fetch(`${kibanaUrl}/api/status?v8format=true`, {
      method: 'GET',
      headers: {
        'Authorization': `ApiKey ${apiKey}`,
        'kbn-xsrf': 'true',
      },
    signal: controller.signal,

    });

    clearTimeout(timeout);
    if (!res.ok) {
      console.error('Error fetching status:', res);
      return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);
    } catch (error: any) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timed out' }, { status: 408 });
    }
    return NextResponse.json({ error: 'Error fetching Kibana status' }, { status: 500 });
  }

  
}