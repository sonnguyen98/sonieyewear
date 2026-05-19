import { NextResponse } from 'next/server'
import { kvGet, KV_KEYS } from '@/lib/kv-store'

export async function GET() {
  const data = await kvGet(KV_KEYS.lensProducts, 'lens-products.json')
  return NextResponse.json(data ?? [], {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}
