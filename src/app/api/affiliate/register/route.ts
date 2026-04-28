import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { kvGet, kvSet, KV_KEYS } from '@/lib/kv-store'

export interface Affiliate {
  id: string
  code: string
  name: string
  phone: string
  passwordHash: string
  bankName: string
  bankAccount: string
  bankOwner: string
  balance: number
  pendingBalance: number
  totalEarned: number
  totalWithdrawn: number
  createdAt: string
  status: 'active' | 'suspended'
}

function hash(s: string) {
  return crypto.createHash('sha256').update(s).digest('hex')
}

function genCode(existing: string[]): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  do {
    code = 'SONI' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  } while (existing.includes(code))
  return code
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone, password, bankName, bankAccount, bankOwner } = await req.json()
    if (!name || !phone || !password || !bankName || !bankAccount || !bankOwner)
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 })

    const affiliates: Affiliate[] = (await kvGet<Affiliate[]>(KV_KEYS.affiliates, 'affiliates.json')) ?? []

    if (affiliates.some(a => a.phone === phone))
      return NextResponse.json({ error: 'Số điện thoại này đã đăng ký' }, { status: 400 })

    const newAffiliate: Affiliate = {
      id: 'aff-' + Date.now(),
      code: genCode(affiliates.map(a => a.code)),
      name, phone,
      passwordHash: hash(password),
      bankName, bankAccount, bankOwner,
      balance: 0, pendingBalance: 0,
      totalEarned: 0, totalWithdrawn: 0,
      createdAt: new Date().toISOString(),
      status: 'active',
    }

    await kvSet(KV_KEYS.affiliates, 'affiliates.json', [...affiliates, newAffiliate])

    const { passwordHash: _, ...safe } = newAffiliate
    return NextResponse.json({ success: true, affiliate: safe })
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
