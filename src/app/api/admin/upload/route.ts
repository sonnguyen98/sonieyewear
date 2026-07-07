import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/adminAuth'
import { saveImage } from '@/lib/uploadStore'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: NextRequest) {
  if (!await checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  const productId = (formData.get('productId') as string ?? '').replace(/[^a-zA-Z0-9_-]/g, '')

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File quá lớn (tối đa 10MB)' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: 'Chỉ chấp nhận file ảnh (JPG, PNG, WebP, GIF, AVIF)' }, { status: 400 })

  const rawExt = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const ext = ALLOWED_EXTS.includes(rawExt) ? rawExt : 'jpg'

  try {
    const result = await saveImage(file, `products${productId ? '/' + productId : ''}`, ext)
    return NextResponse.json(result)
  } catch (e: any) {
    console.error('Upload saveImage error:', e)
    return NextResponse.json({ error: e?.message ?? 'Lưu ảnh thất bại' }, { status: 500 })
  }
}
