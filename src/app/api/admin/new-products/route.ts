import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const FILE = path.join(process.cwd(), 'src', 'data', 'new-products.json')

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-token') === (process.env.ADMIN_PASSWORD ?? 'admin123')
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try { return NextResponse.json(JSON.parse(fs.readFileSync(FILE, 'utf-8'))) }
  catch { return NextResponse.json([]) }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const product = await req.json()
  let existing = []
  try { existing = JSON.parse(fs.readFileSync(FILE, 'utf-8')) } catch {}
  existing.push(product)
  fs.writeFileSync(FILE, JSON.stringify(existing, null, 2))

  // Touch products.ts để trigger hot reload
  const tsFile = path.join(process.cwd(), 'src', 'data', 'products.ts')
  const content = fs.readFileSync(tsFile, 'utf-8')
  const ts = `// cache-bust: ${Date.now()}`
  fs.writeFileSync(tsFile, content.replace(/\/\/ cache-bust: \d+/, ts))

  return NextResponse.json({ success: true })
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, data } = await req.json()
  let existing = []
  try { existing = JSON.parse(fs.readFileSync(FILE, 'utf-8')) } catch {}
  existing = existing.map((p: { id: string }) => p.id === id ? { ...p, ...data } : p)
  fs.writeFileSync(FILE, JSON.stringify(existing, null, 2))
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  let existing = []
  try { existing = JSON.parse(fs.readFileSync(FILE, 'utf-8')) } catch {}
  existing = existing.filter((p: { id: string }) => p.id !== id)
  fs.writeFileSync(FILE, JSON.stringify(existing, null, 2))

  // Touch products.ts để trigger hot reload
  const tsFile = path.join(process.cwd(), 'src', 'data', 'products.ts')
  const content = fs.readFileSync(tsFile, 'utf-8')
  const ts = `// cache-bust: ${Date.now()}`
  const updated = content.includes('// cache-bust:')
    ? content.replace(/\/\/ cache-bust: \d+/, ts)
    : content + `\n${ts}\n`
  fs.writeFileSync(tsFile, updated)

  return NextResponse.json({ success: true })
}
