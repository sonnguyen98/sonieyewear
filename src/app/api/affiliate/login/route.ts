import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { kvGet, KV_KEYS } from '@/lib/kv-store'
import type { Affiliate } from '../register/route'

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json()
    if (!phone || !password)
      return NextResponse.json({ error: 'Thiếu thông tin đăng nhập' }, { status: 400 })

    const affiliates: Affiliate[] = (await kvGet<Affiliate[]>(KV_KEYS.affiliates, 'affiliates.json')) ?? []
    const aff = affiliates.find(a => a.phone === phone)

    if (!aff || aff.passwordHash !== crypto.createHash('sha256').update(password).digest('hex'))
      return NextResponse.json({ error: 'Số điện thoại hoặc mật khẩu không đúng' }, { status: 401 })

    if (aff.status === 'suspended')
      return NextResponse.json({ error: 'Tài khoản đã bị tạm khóa' }, { status: 403 })

    const { passwordHash: _, ...safe } = aff
    return NextResponse.json({ success: true, affiliate: safe })
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
