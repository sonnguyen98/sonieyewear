import { NextRequest, NextResponse } from 'next/server'
import { registerAffiliate } from '@/lib/affiliateStore'
import { applyRateLimit, limiters, getClientIp } from '@/lib/ratelimit'

// Re-export Affiliate type cho các module cũ import từ đây
export type { Affiliate } from '@/lib/affiliateStore'

export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(limiters.affiliateRegister, getClientIp(req))
  if (limited) return limited

  try {
    const { name, phone, password, bankName, bankAccount, bankOwner } = await req.json()
    if (!name || !phone || !password || !bankName || !bankAccount || !bankOwner)
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 })

    const result = await registerAffiliate({ name, phone, password, bankName, bankAccount, bankOwner })
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })

    const { passwordHash: _, ...safe } = result.affiliate
    return NextResponse.json({ success: true, affiliate: safe })
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
