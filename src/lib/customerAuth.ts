import { NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'

export const CUSTOMER_COOKIE = 'soni_customer'
export const SESSION_TTL_SEC = 7 * 24 * 60 * 60  // 7 ngày

const KEY_PREFIX = 'cust-session:'

const HAS_REDIS = !!process.env.KV_REST_API_URL
const redis = HAS_REDIS
  ? new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })
  : null

// Dev fallback: in-memory (mất khi restart server, đủ cho development)
const devSessions = new Map<string, string>()

export async function createCustomerSession(token: string, customerId: string): Promise<void> {
  if (redis) {
    await redis.set(`${KEY_PREFIX}${token}`, customerId, { ex: SESSION_TTL_SEC })
  } else {
    devSessions.set(token, customerId)
  }
}

export async function destroyCustomerSession(token: string): Promise<void> {
  if (redis) {
    await redis.del(`${KEY_PREFIX}${token}`)
  } else {
    devSessions.delete(token)
  }
}

export async function getCustomerIdFromSession(token: string): Promise<string | null> {
  if (redis) {
    return await redis.get<string>(`${KEY_PREFIX}${token}`)
  }
  return devSessions.get(token) ?? null
}

// Trả về customerId nếu request có session hợp lệ, null nếu không
export async function getCustomerIdFromRequest(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get(CUSTOMER_COOKIE)?.value
  if (!token) return null
  return getCustomerIdFromSession(token)
}

// Helper để set cookie trên Response
export function buildSessionCookie(token: string): string {
  const maxAge = SESSION_TTL_SEC
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${CUSTOMER_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`
}

export function buildClearCookie(): string {
  return `${CUSTOMER_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`
}
