import { NextRequest, NextResponse } from 'next/server'
import { resetPasswordByBank } from '@/lib/affiliateStore'
import { applyRateLimit, limiters, getClientIp } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  // Dùng chung limiter login (5 lần/phút theo IP) để chống dò STK
  const limited = await applyRateLimit(limiters.affiliateLogin, getClientIp(req))
  if (limited) return limited

  try {
    const { phone, bankAccount, newPassword } = await req.json()
    if (!phone || !bankAccount || !newPassword)
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 })

    const result = await resetPasswordByBank(phone, bankAccount, newPassword)
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
