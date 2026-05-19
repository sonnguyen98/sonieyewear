import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { ADMIN_COOKIE, SESSION_TTL_SEC, createSession, destroySession, checkAdminAuth } from '@/lib/adminAuth'
import { applyRateLimit, limiters, getClientIp } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(limiters.adminLogin, getClientIp(req))
  if (limited) return limited

  const { password } = await req.json()
  if (!password || password !== (process.env.ADMIN_PASSWORD ?? 'admin123')) {
    return NextResponse.json({ error: 'Sai mật khẩu' }, { status: 401 })
  }

  const token = crypto.randomUUID()
  await createSession(token)

  const res = NextResponse.json({ success: true })
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SEC,
  })
  return res
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value ?? req.headers.get('x-admin-token') ?? ''
  if (token) await destroySession(token)

  const res = NextResponse.json({ success: true })
  res.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, maxAge: 0, path: '/' })
  return res
}

// GET — client kiểm tra "tôi đã login chưa?" (vì cookie HttpOnly không đọc được từ JS)
export async function GET(req: NextRequest) {
  const ok = await checkAdminAuth(req)
  return NextResponse.json({ authenticated: ok })
}
