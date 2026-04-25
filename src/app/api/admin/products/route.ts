import { NextRequest, NextResponse } from 'next/server'
import { getAllProducts, updateProduct } from '@/lib/products-db'
import fs from 'fs'
import path from 'path'

function checkAuth(req: NextRequest) {
  const token = req.headers.get('x-admin-token')
  return token === (process.env.ADMIN_PASSWORD ?? 'admin123')
}

// Touch products.ts để trigger Next.js hot reload
function touchProductsFile() {
  const file = path.join(process.cwd(), 'src', 'data', 'products.ts')
  const content = fs.readFileSync(file, 'utf-8')
  const ts = `// cache-bust: ${Date.now()}`
  const updated = content.includes('// cache-bust:')
    ? content.replace(/\/\/ cache-bust: \d+/, ts)
    : content + `\n${ts}\n`
  fs.writeFileSync(file, updated)
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(getAllProducts())
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, data } = await req.json()
  const updated = updateProduct(id, data)
  touchProductsFile()
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  // Đánh dấu hidden thay vì xoá hẳn (để tránh mất data)
  updateProduct(id, { hidden: true } as Parameters<typeof updateProduct>[1])
  touchProductsFile()
  return NextResponse.json({ success: true })
}
