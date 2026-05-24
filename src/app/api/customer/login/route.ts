import { NextRequest, NextResponse } from 'next/server'
import { verifyCustomerLogin, stripPassword } from '@/lib/customerStore'
import { createCustomerSession, buildSessionCookie } from '@/lib/customerAuth'
import { applyRateLimit, limiters, getClientIp } from '@/lib/ratelimit'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(limiters.customerLogin, getClientIp(req))
  if (limited) return limited

  try {
    const { phone, password } = await req.json()

    if (!phone || !password)
      return NextResponse.json({ error: 'Thiếu thông tin đăng nhập' }, { status: 400 })

    const customer = await verifyCustomerLogin(phone, password)
    if (!customer)
      return NextResponse.json({ error: 'Số điện thoại hoặc mật khẩu không đúng' }, { status: 401 })

    const token = crypto.randomUUID()
    await createCustomerSession(token, customer.id)

    const res = NextResponse.json({ success: true, customer: stripPassword(customer) })
    res.headers.set('Set-Cookie', buildSessionCookie(token))
    return res
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
