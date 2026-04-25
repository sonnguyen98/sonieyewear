import { NextResponse } from 'next/server'
import { kvGet, KV_KEYS } from '@/lib/kv-store'

export async function GET() {
  const stock = (await kvGet(KV_KEYS.stock, 'stock.json')) ?? {}
  return NextResponse.json(stock)
}
