// kib.a/src/app/api/elastic/kv/route.ts
import { esClient } from '@/lib/elasticsearch';
const index = process.env.KIBALERT_INDEX_PREFIX + '-variables';
export async function POST(req: Request) {

    const { key, value } = await req.json()
    if ( !key ) {
      return Response.json({ error: 'Invalid parameters' }, { status: 400 })
    }
    
    const resp = await esClient.index({ index, id: String(key), document: { data: value, "@timestamp": new Date().toISOString() }, refresh: 'wait_for' })
    if ( !resp.result || resp.result !== 'created' && resp.result !== 'updated' ) {
      return Response.json({ error: 'Failed to create or update document' }, { status: 500 })
    }
    return Response.json({ ok: true })

}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')

  if ( !index || !key) {
    return Response.json({ error: 'Invalid parameters' }, { status: 400 })
  }
 

    const resp = await esClient.get({ index, id: key })
    if (!resp.found) {
      return Response.json({ found: false }, { status: 404 })
    }
    return Response.json({ found: true, _source: resp._source })

}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')

  if ( !index || !key) {
    return Response.json({ error: 'Invalid parameters' }, { status: 400 })
  }

 
    const resp = await esClient.delete({ index, id: key, refresh: 'wait_for' })
    if (!resp.result || resp.result !== 'deleted') {
      return Response.json({ found: false }, { status: 404 })
    }
    return Response.json({ ok: true })
  
}