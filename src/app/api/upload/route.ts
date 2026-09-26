import { getCloudflareContext } from '@opennextjs/cloudflare'

export async function POST(request: Request) {
  const { env } = getCloudflareContext()
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }
  if (file.type.split('/')[0] !== 'image') {
    return Response.json({ error: 'We only accept image files' }, { status: 400 })
  }
  if (file.size / 1024 / 1024 > 2) {
    return Response.json({ error: 'File size too big (max 2MB)' }, { status: 400 })
  }

  const key = `uploads/${crypto.randomUUID()}-${file.name}`

  await env.MESSAGE_ASSETS.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  })

  return Response.json({
    key,
    url: `/api/file/${encodeURIComponent(key)}`,
  })
}
