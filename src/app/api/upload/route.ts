//
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { NextResponse } from 'next/server'

export async function POST(request: Request): Promise<NextResponse> {
  const { env } = getCloudflareContext()

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.type.split('/')[0] !== 'image') {
    return NextResponse.json(
      { error: 'We only accept image files' },
      { status: 400 }
    )
  }

  if (file.size / 1024 / 1024 > 2) {
    return NextResponse.json(
      { error: 'File size too big (max 2MB)' },
      { status: 400 }
    )
  }

  const key = `uploads/${crypto.randomUUID()}-${file.name}`

  try {
    await env.MESSAGE_ASSETS.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
    })

    return NextResponse.json({
      key,
      url: `/api/file/${encodeURIComponent(key)}`,
    })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
