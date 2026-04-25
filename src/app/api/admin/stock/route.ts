import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const FILE = path.join(process.cwd(), 'src', 'data', 'stock.json')

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-token') === (process.env.ADMIN_PASSWORD ?? 'admin123')
}

function read(): Record<string, { inStock: boolean; quantity: number }> {
  try { return JSON.parse(fs.readFileSync(FILE, 'utf-8')) } catch { return {} }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(read())
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2))
  return NextResponse.json({ success: true })
}

// Trừ tồn kho khi có đơn hàng — không cần auth (gọi từ order API nội bộ)
export async function PATCH(req: NextRequest) {
  const { variantIds } = await req.json() // mảng color variant IDs cần trừ
  const stock = read()
  let changed = false

  for (const vid of (variantIds as string[])) {
    if (stock[vid] && stock[vid].quantity > 0) {
      stock[vid].quantity -= 1
      if (stock[vid].quantity === 0) {
        stock[vid].inStock = false
      }
      changed = true
    }
  }

  if (changed) fs.writeFileSync(FILE, JSON.stringify(stock, null, 2))
  return NextResponse.json({ success: true, stock })
}
