import { NextRequest, NextResponse } from 'next/server'
import { kvGet, kvSet, KV_KEYS } from '@/lib/kv-store'

const ALLOWED: Record<string, string> = {
  'lens-products': KV_KEYS.lensProducts,
  'blog-posts':    KV_KEYS.blogPosts,
  'stores':        KV_KEYS.stores,
  'policies':      KV_KEYS.policies,
}

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-token') === (process.env.ADMIN_PASSWORD ?? 'admin123')
}

export async function GET(req: NextRequest, { params }: { params: { type: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const kvKey = ALLOWED[params.type]
  if (!kvKey) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const data = await kvGet(kvKey, `${params.type}.json`)
  return NextResponse.json(data ?? [])
}

export async function PUT(req: NextRequest, { params }: { params: { type: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const kvKey = ALLOWED[params.type]
  if (!kvKey) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const data = await req.json()
  await kvSet(kvKey, `${params.type}.json`, data)
  return NextResponse.json({ success: true })
}
