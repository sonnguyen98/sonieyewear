import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const ALLOWED = ['lens-products', 'blog-posts', 'stores', 'policies']

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-token') === (process.env.ADMIN_PASSWORD ?? 'admin123')
}

function getFilePath(type: string) {
  return path.join(process.cwd(), 'src', 'data', `${type}.json`)
}

export async function GET(req: NextRequest, { params }: { params: { type: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!ALLOWED.includes(params.type)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const file = getFilePath(params.type)
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, { params }: { params: { type: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!ALLOWED.includes(params.type)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data = await req.json()
  const file = getFilePath(params.type)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
  return NextResponse.json({ success: true })
}
