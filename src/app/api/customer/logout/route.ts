import { NextRequest, NextResponse } from 'next/server'
import { destroyCustomerSession, CUSTOMER_COOKIE, buildClearCookie } from '@/lib/customerAuth'

export async function POST(req: NextRequest) {
  const token = req.cookies.get(CUSTOMER_COOKIE)?.value
  if (token) await destroyCustomerSession(token)

  const res = NextResponse.json({ success: true })
  res.headers.set('Set-Cookie', buildClearCookie())
  return res
}
