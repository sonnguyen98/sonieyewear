/**
 * Unified data store:
 * - Production (Vercel): dùng Upstash Redis
 * - Development (local): dùng file JSON
 */

import fs from 'fs'
import path from 'path'
import { Redis } from '@upstash/redis'

// Dùng Redis nếu có credentials (cả production lẫn local khi đã cài .env.local)
const IS_PROD = !!process.env.KV_REST_API_URL

let _redis: Redis | null = null
function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
  }
  return _redis
}

// ── Đọc dữ liệu ──────────────────────────────────────────────────────────────
export async function kvGet<T>(key: string, fallbackFile: string): Promise<T | null> {
  if (IS_PROD) {
    try {
      const redis = getRedis()
      const data = await redis.get<T>(key)
      // Lần đầu chưa có trong Redis → seed từ file bundled
      if (data === null) {
        const file = path.join(process.cwd(), 'src', 'data', fallbackFile)
        try {
          const raw = JSON.parse(fs.readFileSync(file, 'utf-8'))
          await redis.set(key, raw)
          return raw as T
        } catch { return null }
      }
      return data
    } catch (e) {
      console.error('Redis get error:', e)
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
      const redis = getRedis()
      await redis.set(key, data)
    } catch (e) {
      console.error('Redis set error:', e)
    }
    return
  }

  // Development: ghi file
  const file = path.join(process.cwd(), 'src', 'data', fallbackFile)
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
}

// ── Các key chuẩn ─────────────────────────────────────────────────────────────
export const KV_KEYS = {
  adminSessions:         'admin-sessions',
  overrides:             'products-override',
  stock:                 'stock',
  newProducts:           'new-products',
  lensProducts:          'lens-products',
  blogPosts:             'blog-posts',
  stores:                'stores',
  policies:              'policies',
  affiliates:            'affiliates',
  affiliateCommissions:  'affiliate-commissions',
  affiliateWithdrawals:  'affiliate-withdrawals',
}
