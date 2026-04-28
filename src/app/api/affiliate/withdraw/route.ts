import { NextRequest, NextResponse } from 'next/server'
import { kvGet, kvSet, KV_KEYS } from '@/lib/kv-store'
import type { Affiliate } from '../register/route'
import type { AffiliateWithdrawal } from '../dashboard/route'

const MIN_WITHDRAW = 100000

export async function POST(req: NextRequest) {
  const code = req.headers.get('x-affiliate-code')
  const phone = req.headers.get('x-affiliate-phone')
  if (!code || !phone) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const affiliates: Affiliate[] = (await kvGet<Affiliate[]>(KV_KEYS.affiliates, 'affiliates.json')) ?? []
  const idx = affiliates.findIndex(a => a.code === code && a.phone === phone)
  if (idx === -1) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const aff = affiliates[idx]
  if (aff.balance < MIN_WITHDRAW)
    return NextResponse.json({ error: `Số dư tối thiểu để rút là ${MIN_WITHDRAW.toLocaleString('vi-VN')}đ` }, { status: 400 })

  const { amount } = await req.json()
  const withdrawAmount = Math.min(amount ?? aff.balance, aff.balance)
  if (withdrawAmount < MIN_WITHDRAW)
    return NextResponse.json({ error: 'Số tiền rút không hợp lệ' }, { status: 400 })

  // Trừ số dư
  affiliates[idx] = { ...aff, balance: aff.balance - withdrawAmount, totalWithdrawn: aff.totalWithdrawn + withdrawAmount }
  await kvSet(KV_KEYS.affiliates, 'affiliates.json', affiliates)

  // Tạo lệnh rút
  const withdrawals: AffiliateWithdrawal[] = (await kvGet<AffiliateWithdrawal[]>(KV_KEYS.affiliateWithdrawals, 'affiliate-withdrawals.json')) ?? []
  const newWithdrawal: AffiliateWithdrawal = {
    id: 'wd-' + Date.now(),
    affiliateCode: code,
    affiliateName: aff.name,
    affiliatePhone: aff.phone,
    amount: withdrawAmount,
    bankName: aff.bankName,
    bankAccount: aff.bankAccount,
    bankOwner: aff.bankOwner,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  }
  await kvSet(KV_KEYS.affiliateWithdrawals, 'affiliate-withdrawals.json', [...withdrawals, newWithdrawal])

  // Thông báo cho admin qua Google Sheet (nếu có)
  const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL
  if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes('paste_your')) {
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'affiliateWithdraw', ...newWithdrawal }),
      redirect: 'follow',
    }).catch(() => {})
  }

  return NextResponse.json({ success: true, withdrawal: newWithdrawal })
}
