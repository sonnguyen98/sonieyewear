import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/adminAuth'
import fs from 'fs'
import path from 'path'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif']
// Chỉ cho phép upload vào các thư mục được kiểm soát
const ALLOWED_FOLDERS = ['blog', 'lens', 'content', 'stores', 'categories']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: NextRequest) {
  if (!await checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const rawFolder = (formData.get('folder') as string ?? 'content').toLowerCase().trim()

  // Whitelist folder để ngăn path traversal
  const folder = ALLOWED_FOLDERS.includes(rawFolder) ? rawFolder : 'content'

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File quá lớn (tối đa 10MB)' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Chỉ chấp nhận file ảnh (JPG, PNG, WebP, GIF, AVIF)' }, { status: 400 })

  const rawExt = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const ext = ALLOWED_EXTS.includes(rawExt) ? rawExt : 'jpg'
  const filename = `${folder}-${Date.now()}.${ext}`

  // path.join tự normalize, nhưng đã whitelist folder nên an toàn tuyệt đối
  const dir = path.join(process.cwd(), 'public', 'images', folder)
  const bytes = await file.arrayBuffer()
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, filename), Buffer.from(bytes))

  return NextResponse.json({ url: `/images/${folder}/${filename}` })
}
