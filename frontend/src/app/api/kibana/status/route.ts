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
  } catch (error) {
    clearTimeout(timeout);
    console.error('Error fetching :', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }

  
}