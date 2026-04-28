import { NextRequest, NextResponse } from 'next/server'
import { kvGet, kvSet, KV_KEYS } from '@/lib/kv-store'
import { checkAdminAuth } from '@/lib/adminAuth'

type StockMap = Record<string, { inStock: boolean; quantity: number }>

export async function GET(req: NextRequest) {
  if (!await checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const stock = (await kvGet<StockMap>(KV_KEYS.stock, 'stock.json')) ?? {}
  return NextResponse.json(stock)
}

export async function PUT(req: NextRequest) {
  if (!await checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  await kvSet(KV_KEYS.stock, 'stock.json', data)
  return NextResponse.json({ success: true })
}

// PATCH — chỉ gọi nội bộ từ order route, dùng internal secret
export async function PATCH(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret')
  if (secret !== (process.env.INTERNAL_API_SECRET ?? '')) {
    // Fallback: cho phép admin token
    if (!await checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { variantIds } = await req.json()
  if (!Array.isArray(variantIds)) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  const stock = (await kvGet<StockMap>(KV_KEYS.stock, 'stock.json')) ?? {}
  let changed = false
  for (const vid of variantIds as string[]) {
    if (typeof vid !== 'string' || !stock[vid]) continue
    if (stock[vid].quantity > 0) {
      stock[vid].quantity -= 1
      if (stock[vid].quantity === 0) stock[vid].inStock = false
      changed = true
    }
  }
  if (changed) await kvSet(KV_KEYS.stock, 'stock.json', stock)
  return NextResponse.json({ success: true, stock })
}
