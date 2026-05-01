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

// PATCH — gọi nội bộ từ order route để trừ tồn kho
export async function PATCH(req: NextRequest) {
  const internalSecret = process.env.INTERNAL_API_SECRET
  if (internalSecret) {
    // Nếu đã cấu hình secret → bắt buộc xác thực
    const sent = req.headers.get('x-internal-secret') ?? ''
    if (sent !== internalSecret && !await checkAdminAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  // Nếu INTERNAL_API_SECRET chưa set → cho phép (server-to-server call)

  const { variantIds } = await req.json()
  if (!Array.isArray(variantIds)) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  const stock = (await kvGet<StockMap>(KV_KEYS.stock, 'stock.json')) ?? {}
  const decremented: string[] = []
  const outOfStock: string[] = []

  for (const vid of variantIds as string[]) {
    if (typeof vid !== 'string') continue
    if (!stock[vid] || stock[vid].quantity <= 0) {
      outOfStock.push(vid) // Hết hàng — từ chối
    } else {
      stock[vid].quantity -= 1
      if (stock[vid].quantity === 0) stock[vid].inStock = false
      decremented.push(vid)
    }
  }

  if (decremented.length > 0) await kvSet(KV_KEYS.stock, 'stock.json', stock)
  return NextResponse.json({ success: outOfStock.length === 0, stock, outOfStock })
}
