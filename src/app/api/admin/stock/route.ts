import { NextRequest, NextResponse } from 'next/server'
import { kvGet, kvSet, KV_KEYS } from '@/lib/kv-store'

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-token') === (process.env.ADMIN_PASSWORD ?? 'admin123')
}

type StockMap = Record<string, { inStock: boolean; quantity: number }>

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const stock = (await kvGet<StockMap>(KV_KEYS.stock, 'stock.json')) ?? {}
  return NextResponse.json(stock)
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  await kvSet(KV_KEYS.stock, 'stock.json', data)
  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest) {
  const { variantIds } = await req.json()
  const stock = (await kvGet<StockMap>(KV_KEYS.stock, 'stock.json')) ?? {}
  let changed = false
  for (const vid of (variantIds as string[])) {
    if (stock[vid] && stock[vid].quantity > 0) {
      stock[vid].quantity -= 1
      if (stock[vid].quantity === 0) stock[vid].inStock = false
      changed = true
    }
  }
  if (changed) await kvSet(KV_KEYS.stock, 'stock.json', stock)
  return NextResponse.json({ success: true, stock })
}
