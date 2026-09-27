import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextResponse } from 'next/server'

export async function POST(request: Request): Promise<NextResponse> {
  const { env } = await getCloudflareContext({ async: true })

  const filename = request.headers.get('x-filename') || 'file'
  const contentType = request.headers.get('content-type') || 'application/octet-stream'

  if (!contentType.startsWith('image/')) {
    return NextResponse.json({ error: 'We only accept image files' }, { status: 400 })
  }

  const size = Number(request.headers.get('content-length') || 0)
  if (size / 1024 / 1024 > 2) {
    return NextResponse.json({ error: 'File size too big (max 2MB)' }, { status: 400 })
  }

  const key = `uploads/${crypto.randomUUID()}-${filename}`

  try {
    await env.MESSAGE_ASSETS.put(key, request.body, {
      httpMetadata: { contentType },
    })

    return NextResponse.json({ key, url: `${env.PUBLIC_URL}/${key}` })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
