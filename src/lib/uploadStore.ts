import { put } from '@vercel/blob'
import fs from 'fs'
import path from 'path'

const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN

export interface UploadResult { url: string }

// Lưu file ảnh — production dùng Vercel Blob (persistent), dev dùng filesystem.
// `prefix` ví dụ: "products", "blog", "stores"
export async function saveImage(
  file: File, prefix: string, ext: string
): Promise<UploadResult> {
  // Tên file chỉ dùng segment cuối của prefix — tránh lặp lại cả đường dẫn con
  // (vd prefix "products/new-123" → base "new-123"), nếu không sẽ ghi sai thư mục lồng.
  const base = prefix.split('/').pop() || prefix
  const filename = `${base}-${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  if (USE_BLOB) {
    const blob = await put(`${prefix}/${filename}`, buffer, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false,
    })
    return { url: blob.url }
  }

  // Dev fallback: filesystem
  const dir = path.join(process.cwd(), 'public', 'images', prefix)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, filename), buffer)
  return { url: `/images/${prefix}/${filename}` }
}
