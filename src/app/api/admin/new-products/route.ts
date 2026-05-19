import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { kvGet, kvSet, KV_KEYS } from '@/lib/kv-store'
import { checkAdminAuth } from '@/lib/adminAuth'
import type { Product } from '@/types/product'

function touchProducts() {
  revalidatePath('/gong-kinh')
  revalidatePath('/')
}

export async function GET(req: NextRequest) {
  if (!await checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json((await kvGet<Product[]>(KV_KEYS.newProducts, 'new-products.json')) ?? [])
}

export async function POST(req: NextRequest) {
  if (!await checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const product = await req.json()
  const existing = (await kvGet<Product[]>(KV_KEYS.newProducts, 'new-products.json')) ?? []
  existing.push(product)
  await kvSet(KV_KEYS.newProducts, 'new-products.json', existing)
  touchProducts()
  return NextResponse.json({ success: true })
}

export async function PUT(req: NextRequest) {
  if (!await checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, data } = await req.json()
  let existing = (await kvGet<Product[]>(KV_KEYS.newProducts, 'new-products.json')) ?? []
  existing = existing.map((p: Product) => p.id === id ? { ...p, ...data } : p)
  await kvSet(KV_KEYS.newProducts, 'new-products.json', existing)
  touchProducts()
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  if (!await checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  let existing = (await kvGet<Product[]>(KV_KEYS.newProducts, 'new-products.json')) ?? []
  existing = existing.filter((p: Product) => p.id !== id)
  await kvSet(KV_KEYS.newProducts, 'new-products.json', existing)
  touchProducts()
  return NextResponse.json({ success: true })
}
