import { NextRequest, NextResponse } from 'next/server'
import { verifyAffiliateLogin } from '@/lib/affiliateStore'
import { applyRateLimit, limiters, getClientIp } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(limiters.affiliateLogin, getClientIp(req))
  if (limited) return limited

  try {
    const { phone, password } = await req.json()
    if (!phone || !password)
      return NextResponse.json({ error: 'Thiếu thông tin đăng nhập' }, { status: 400 })

    const aff = await verifyAffiliateLogin(phone, password)
    if (!aff)
      return NextResponse.json({ error: 'Số điện thoại hoặc mật khẩu không đúng' }, { status: 401 })

    if (aff.status === 'suspended')
      return NextResponse.json({ error: 'Tài khoản đã bị tạm khóa' }, { status: 403 })

    const { passwordHash: _, ...safe } = aff
    return NextResponse.json({ success: true, affiliate: safe })
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
