import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextResponse } from 'next/server'

export async function POST(request: Request): Promise<NextResponse> {
  const { env } = await getCloudflareContext({ async: true })

  const filename = request.headers.get('x-filename') || 'file'
  const contentType = request.headers.get('content-type') || 'application/octet-stream'

  if (!contentType.startsWith('image/')) {
    return NextResponse.json({ error: 'We only accept image files' }, { status: 400 })
  }

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength / 1024 / 1024 > 2) {
    return NextResponse.json({ error: 'File size too big (max 2MB)' }, { status: 400 })
  }

  const key = `uploads/${crypto.randomUUID()}-${filename}`

  try {
    const body = new FixedLengthStream(contentLength)
    request.body.pipeTo(body.writable)
    
    await env.MESSAGE_ASSETS.put(key, body.readable, {
      httpMetadata: { contentType },
    })

    return NextResponse.json({ key, url: `https://pub-ad7376f5ad43494a86311f9b39971d8c.r2.dev/${key}` })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
