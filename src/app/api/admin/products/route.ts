import { NextRequest, NextResponse } from 'next/server'
import { kvGet, kvSet, KV_KEYS } from '@/lib/kv-store'
import { checkAdminAuth } from '@/lib/adminAuth'
import { PRODUCTS } from '@/data/products'
import type { Product } from '@/types/product'
import fs from 'fs'
import path from 'path'

function touchProductsFile() {
  try {
    const file = path.join(process.cwd(), 'src', 'data', 'products.ts')
    const content = fs.readFileSync(file, 'utf-8')
    const ts = `// cache-bust: ${Date.now()}`
    const updated = content.includes('// cache-bust:')
      ? content.replace(/\/\/ cache-bust: \d+/, ts)
      : content + `\n${ts}\n`
    fs.writeFileSync(file, updated)
  } catch {}
}

type Override = Partial<Product> & { hidden?: boolean }

export async function GET(req: NextRequest) {
  if (!await checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const overrides = (await kvGet<Record<string, Override>>(KV_KEYS.overrides, 'products-override.json')) ?? {}
  const newProducts = (await kvGet<Product[]>(KV_KEYS.newProducts, 'new-products.json')) ?? []
  const allProducts = [
    ...PRODUCTS.filter(p => !overrides[p.id]?.hidden).map(p => ({ ...p, ...(overrides[p.id] ?? {}), lensPackages: p.lensPackages })),
    ...newProducts.filter(p => !overrides[p.id]?.hidden).map(p => ({ ...p, ...(overrides[p.id] ?? {}) })),
  ]
  return NextResponse.json(allProducts)
}

export async function PUT(req: NextRequest) {
  if (!await checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, data } = await req.json()
  const overrides = (await kvGet<Record<string, Override>>(KV_KEYS.overrides, 'products-override.json')) ?? {}
  overrides[id] = { ...(overrides[id] ?? {}), ...data }
  await kvSet(KV_KEYS.overrides, 'products-override.json', overrides)
  touchProductsFile()
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  if (!await checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  const overrides = (await kvGet<Record<string, Override>>(KV_KEYS.overrides, 'products-override.json')) ?? {}
  overrides[id] = { ...(overrides[id] ?? {}), hidden: true }
  await kvSet(KV_KEYS.overrides, 'products-override.json', overrides)
  touchProductsFile()
  return NextResponse.json({ success: true })
}
