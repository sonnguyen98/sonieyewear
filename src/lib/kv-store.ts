/**
 * Unified data store:
 * - Production (Vercel): dùng Vercel KV (Redis)
 * - Development (local): dùng file JSON
 */

import fs from 'fs'
import path from 'path'

const IS_PROD = process.env.NODE_ENV === 'production' && process.env.KV_REST_API_URL

// ── Đọc dữ liệu ──────────────────────────────────────────────────────────────
export async function kvGet<T>(key: string, fallbackFile: string): Promise<T | null> {
  if (IS_PROD) {
    try {
      const { kv } = await import('@vercel/kv')
      const data = await kv.get<T>(key)
      // Lần đầu chưa có trong KV → seed từ file bundled
      if (data === null) {
        const file = path.join(process.cwd(), 'src', 'data', fallbackFile)
        try {
          const raw = JSON.parse(fs.readFileSync(file, 'utf-8'))
          await kv.set(key, raw)
          return raw as T
        } catch { return null }
      }
      return data
    } catch (e) {
      console.error('KV get error:', e)
      return null
    }
  }

  // Development: đọc file
  try {
    const file = path.join(process.cwd(), 'src', 'data', fallbackFile)
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as T
  } catch { return null }
}

// ── Ghi dữ liệu ──────────────────────────────────────────────────────────────
export async function kvSet(key: string, fallbackFile: string, data: unknown): Promise<void> {
  if (IS_PROD) {
    try {
      const { kv } = await import('@vercel/kv')
      await kv.set(key, data)
    } catch (e) {
      console.error('KV set error:', e)
    }
    return
  }

  // Development: ghi file
  const file = path.join(process.cwd(), 'src', 'data', fallbackFile)
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
}

// ── Các key chuẩn ─────────────────────────────────────────────────────────────
export const KV_KEYS = {
  overrides:     'products-override',
  stock:         'stock',
  newProducts:   'new-products',
  lensProducts:  'lens-products',
  blogPosts:     'blog-posts',
  stores:        'stores',
  policies:      'policies',
}
