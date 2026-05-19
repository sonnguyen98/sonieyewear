import { NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'

export const ADMIN_COOKIE = 'soni_admin'
export const SESSION_TTL_SEC = 8 * 60 * 60 // 8 giờ
const KEY_PREFIX = 'admin-session:'

const HAS_REDIS = !!process.env.KV_REST_API_URL
const redis = HAS_REDIS
  ? new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })
  : null

// ── Session ops (per-token, không race) ────────────────────────────────────
export async function createSession(token: string): Promise<void> {
  if (redis) {
    await redis.set(`${KEY_PREFIX}${token}`, 1, { ex: SESSION_TTL_SEC })
  }
}

export async function destroySession(token: string): Promise<void> {
  if (redis) await redis.del(`${KEY_PREFIX}${token}`)
}

async function sessionExists(token: string): Promise<boolean> {
  if (!redis) return false
  const v = await redis.get(`${KEY_PREFIX}${token}`)
  return v !== null
}

// ── Auth check ─────────────────────────────────────────────────────────────
export async function checkAdminAuth(req: NextRequest): Promise<boolean> {
  // Ưu tiên cookie (mới); fallback header x-admin-token (backward compat 1 deploy)
  const token = req.cookies.get(ADMIN_COOKIE)?.value ?? req.headers.get('x-admin-token') ?? ''
  if (!token) return false

  if (await sessionExists(token)) return true

  // Dev fallback: cho phép raw password (không khuyến khích prod)
  if (process.env.NODE_ENV !== 'production' && token === (process.env.ADMIN_PASSWORD ?? 'admin123')) return true

  return false
}
