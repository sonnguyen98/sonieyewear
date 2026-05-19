import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { kvGet, kvSet, KV_KEYS } from '@/lib/kv-store'
import { checkAdminAuth } from '@/lib/adminAuth'

const ALLOWED: Record<string, string> = {
  'lens-products': KV_KEYS.lensProducts,
  'blog-posts':    KV_KEYS.blogPosts,
  'stores':        KV_KEYS.stores,
  'policies':      KV_KEYS.policies,
}

const REVALIDATE_PATHS: Record<string, string[]> = {
  'lens-products': ['/trong-kinh'],
  'blog-posts':    ['/soni-share'],
  'stores':        ['/he-thong'],
  'policies':      ['/chinh-sach'],
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  if (!await checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { type } = await params
  const kvKey = ALLOWED[type]
  if (!kvKey) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const data = await kvGet(kvKey, `${type}.json`)
  return NextResponse.json(data ?? [])
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  if (!await checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { type } = await params
  const kvKey = ALLOWED[type]
  if (!kvKey) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const data = await req.json()
  await kvSet(kvKey, `${type}.json`, data)
  for (const p of REVALIDATE_PATHS[type] ?? []) revalidatePath(p)
  return NextResponse.json({ success: true })
}
