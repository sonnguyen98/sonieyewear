import { NextRequest, NextResponse } from 'next/server'
import { registerCustomer, stripPassword } from '@/lib/customerStore'
import { createCustomerSession, buildSessionCookie } from '@/lib/customerAuth'
import { applyRateLimit, limiters, getClientIp } from '@/lib/ratelimit'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(limiters.customerRegister, getClientIp(req))
  if (limited) return limited

  try {
    const { name, email, phone, password, dob } = await req.json()

    if (!name || !email || !phone || !password)
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 })

    if (password.length < 6)
      return NextResponse.json({ error: 'Mật khẩu tối thiểu 6 ký tự' }, { status: 400 })

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })

    const result = await registerCustomer({ name, email, phone, password, dob })
    if (!result.ok)
      return NextResponse.json({ error: result.error }, { status: 400 })

    // Tự động đăng nhập sau khi đăng ký
    const token = crypto.randomUUID()
    await createCustomerSession(token, result.customer.id)

    const res = NextResponse.json({ success: true, customer: stripPassword(result.customer) })
    res.headers.set('Set-Cookie', buildSessionCookie(token))
    return res
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
