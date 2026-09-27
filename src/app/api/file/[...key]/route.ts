import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { env } = await getCloudflareContext({ async: true })
  const { key } = await params
  const objectKey = key.join('/')

  const object = await env.MESSAGE_ASSETS.get(objectKey)
  if (!object) {
    return new Response('Not found', { status: 404 })
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  headers.set('cache-control', 'public, max-age=31536000, immutable')

  return new Response(object.body, { headers })
}
