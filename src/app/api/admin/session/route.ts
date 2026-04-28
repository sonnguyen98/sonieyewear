import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { kvGet, kvSet, KV_KEYS } from '@/lib/kv-store'

type Sessions = Record<string, number> // token → expiresAt (ms)

const SESSION_TTL = 8 * 60 * 60 * 1000 // 8 giờ

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (!password || password !== (process.env.ADMIN_PASSWORD ?? 'admin123')) {
    return NextResponse.json({ error: 'Sai mật khẩu' }, { status: 401 })
  }

  const token = crypto.randomUUID()
  const expiresAt = Date.now() + SESSION_TTL

  const sessions: Sessions = (await kvGet<Sessions>(KV_KEYS.adminSessions, 'admin-sessions.json')) ?? {}
  // Dọn session hết hạn
  const cleaned = Object.fromEntries(Object.entries(sessions).filter(([, exp]) => exp > Date.now()))
  cleaned[token] = expiresAt
  await kvSet(KV_KEYS.adminSessions, 'admin-sessions.json', cleaned)

  return NextResponse.json({ token })
}

export async function DELETE(req: NextRequest) {
  const token = req.headers.get('x-admin-token') ?? ''
  const sessions: Sessions = (await kvGet<Sessions>(KV_KEYS.adminSessions, 'admin-sessions.json')) ?? {}
  delete sessions[token]
  await kvSet(KV_KEYS.adminSessions, 'admin-sessions.json', sessions)
  return NextResponse.json({ success: true })
}

// Helper dùng chung cho tất cả admin routes
export async function validateAdminToken(token: string): Promise<boolean> {
  if (!token) return false
  const sessions: Sessions = (await kvGet<Sessions>(KV_KEYS.adminSessions, '')) ?? {}
  const exp = sessions[token]
  if (!exp || exp < Date.now()) return false
  return true
}
