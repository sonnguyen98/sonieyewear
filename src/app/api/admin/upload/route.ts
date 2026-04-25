import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-admin-token')
  if (token !== (process.env.ADMIN_PASSWORD ?? 'admin123')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  const productId = formData.get('productId') as string

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filename = `${productId}-${Date.now()}.${ext}`
  const dir = path.join(process.cwd(), 'public', 'images', 'products')

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  fs.writeFileSync(path.join(dir, filename), buffer)

  return NextResponse.json({ url: `/images/products/${filename}` })
}
