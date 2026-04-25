import { NextRequest, NextResponse } from 'next/server'
import { kvGet, kvSet, KV_KEYS } from '@/lib/kv-store'
import type { Product } from '@/types/product'
import fs from 'fs'
import path from 'path'

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-token') === (process.env.ADMIN_PASSWORD ?? 'admin123')
}

function touchProducts() {
  try {
    const file = path.join(process.cwd(), 'src', 'data', 'products.ts')
    const c = fs.readFileSync(file, 'utf-8')
    const ts = `// cache-bust: ${Date.now()}`
    fs.writeFileSync(file, c.includes('// cache-bust:') ? c.replace(/\/\/ cache-bust: \d+/, ts) : c + `\n${ts}\n`)
  } catch {}
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json((await kvGet<Product[]>(KV_KEYS.newProducts, 'new-products.json')) ?? [])
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const product = await req.json()
  const existing = (await kvGet<Product[]>(KV_KEYS.newProducts, 'new-products.json')) ?? []
  existing.push(product)
  await kvSet(KV_KEYS.newProducts, 'new-products.json', existing)
  touchProducts()
  return NextResponse.json({ success: true })
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, data } = await req.json()
  let existing = (await kvGet<Product[]>(KV_KEYS.newProducts, 'new-products.json')) ?? []
  existing = existing.map((p: Product) => p.id === id ? { ...p, ...data } : p)
  await kvSet(KV_KEYS.newProducts, 'new-products.json', existing)
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  let existing = (await kvGet<Product[]>(KV_KEYS.newProducts, 'new-products.json')) ?? []
  existing = existing.filter((p: Product) => p.id !== id)
  await kvSet(KV_KEYS.newProducts, 'new-products.json', existing)
  touchProducts()
  return NextResponse.json({ success: true })
}
