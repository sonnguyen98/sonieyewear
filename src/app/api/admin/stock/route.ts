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
