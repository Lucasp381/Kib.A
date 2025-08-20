import { NextRequest, NextResponse } from "next/server";



export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // <- pas de "context"
) {
  const { id } = await params; // ✅ params est attendu
  const kibanaUrl = process.env.KIBANA_URL || 'http://127.0.0.1:5601';
    const apiKey = process.env.ELASTIC_API_KEY;
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }
  try {
    // Appel à l'API Kibana pour récupérer les détails de la règle
    const res = await fetch(`${kibanaUrl}/api/alerting/rule/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `ApiKey ${apiKey}`,
        'kbn-xsrf': 'true',
      },
    });

    if (!res.ok) {
      console.error('Error fetching rule:', res);
      return NextResponse.json({ error: 'Failed to fetch rule' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching rule:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }

  

  
}   