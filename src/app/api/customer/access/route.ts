import { NextRequest, NextResponse } from 'next/server'
import { findOrCreateCustomerByPhone, EMAIL_RE } from '@/lib/customerStore'
import { createCustomerSession, buildSessionCookie } from '@/lib/customerAuth'
import { applyRateLimit, limiters, getClientIp } from '@/lib/ratelimit'
import { postToSheet } from '@/lib/googleSheet'
import crypto from 'crypto'

const PHONE_RE = /^0\d{9,10}$/

export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(limiters.customerAccess, getClientIp(req))
  if (limited) return limited

  try {
    const { phone, name, email } = await req.json()

    if (!phone || typeof phone !== 'string' || !PHONE_RE.test(phone.trim()))
      return NextResponse.json({ error: 'Số điện thoại không hợp lệ' }, { status: 400 })

    if (email && (typeof email !== 'string' || !EMAIL_RE.test(email.trim())))
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })

    const customer = await findOrCreateCustomerByPhone(phone, name, email)

    const token = crypto.randomUUID()
    await createCustomerSession(token, customer.id)

    await postToSheet({
      action: 'syncCustomer',
      phone: customer.phone,
      name: customer.name ?? '',
      email: customer.email ?? '',
      createdAt: customer.createdAt,
    })

    const res = NextResponse.json({ success: true, customer })
    res.headers.set('Set-Cookie', buildSessionCookie(token))
    return res
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
