import { kvGet, KV_KEYS } from './kv-store'
import { NextRequest } from 'next/server'

type Sessions = Record<string, number>

export async function checkAdminAuth(req: NextRequest): Promise<boolean> {
  const token = req.headers.get('x-admin-token') ?? ''
  if (!token) return false

  // Kiểm tra session token trong KV store
  const sessions: Sessions = (await kvGet<Sessions>(KV_KEYS.adminSessions, 'admin-sessions.json')) ?? {}
  if (sessions[token] && sessions[token] > Date.now()) return true

  // Fallback: cho phép raw password trong dev (không khuyến khích production)
  if (process.env.NODE_ENV !== 'production' && token === (process.env.ADMIN_PASSWORD ?? 'admin123')) return true

  return false
}
