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
    } catch (e: any) {
      // Next.js cố tình throw DYNAMIC_SERVER_USAGE để detect route động → không phải lỗi thật
      if (e?.digest?.startsWith?.('DYNAMIC_SERVER_USAGE')) throw e
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
    } catch (e: any) {
      if (e?.digest?.startsWith?.('DYNAMIC_SERVER_USAGE')) throw e
      console.error('Redis set error:', e)
    }
    return
  }

  // Development: ghi file
  const file = path.join(process.cwd(), 'src', 'data', fallbackFile)
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8')
}

// ── Distributed lock (Redis SETNX) ──────────────────────────────────────────
// Bảo vệ read-modify-write khỏi race khi 2 request cùng update 1 key.
// Dev mode (single process) → no-op, chỉ chạy fn().
export async function withLock<T>(
  lockKey: string,
  fn: () => Promise<T>,
  opts: { ttlSec?: number; maxRetries?: number; retryDelayMs?: number } = {}
): Promise<T> {
  const { ttlSec = 10, maxRetries = 50, retryDelayMs = 100 } = opts
  if (!IS_PROD) return fn()

  const redis = getRedis()
  const fullKey = `lock:${lockKey}`
  const token = Math.random().toString(36).slice(2)

  for (let i = 0; i < maxRetries; i++) {
    const ok = await redis.set(fullKey, token, { nx: true, ex: ttlSec })
    if (ok === 'OK') {
      try {
        return await fn()
      } finally {
        // Chỉ xóa lock nếu vẫn là của mình (tránh xóa lock người khác sau khi mình đã expire)
        const current = await redis.get<string>(fullKey)
        if (current === token) await redis.del(fullKey)
      }
    }
    await new Promise(r => setTimeout(r, retryDelayMs))
  }
  throw new Error(`Lock timeout: ${lockKey}`)
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
