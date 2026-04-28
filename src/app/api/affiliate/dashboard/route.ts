import { NextRequest, NextResponse } from 'next/server'
import { kvGet, KV_KEYS } from '@/lib/kv-store'
import type { Affiliate } from '../register/route'

export interface AffiliateCommission {
  id: string
  affiliateCode: string
  orderCode: string
  customerName: string
  orderAmount: number
  commission: number
  paymentType: 'prepaid' | 'cod'
  status: 'approved' | 'pending'
  createdAt: string
  approvedAt?: string
}

export interface AffiliateWithdrawal {
  id: string
  affiliateCode: string
  affiliateName: string
  affiliatePhone: string
  amount: number
  bankName: string
  bankAccount: string
  bankOwner: string
  status: 'pending' | 'paid'
  requestedAt: string
  paidAt?: string
}

function checkAuth(req: NextRequest) {
  const code = req.headers.get('x-affiliate-code')
  const phone = req.headers.get('x-affiliate-phone')
  return { code, phone }
}

export async function GET(req: NextRequest) {
  const { code, phone } = checkAuth(req)
  if (!code || !phone) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const affiliates: Affiliate[] = (await kvGet<Affiliate[]>(KV_KEYS.affiliates, 'affiliates.json')) ?? []
  const aff = affiliates.find(a => a.code === code && a.phone === phone)
  if (!aff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allCommissions: AffiliateCommission[] = (await kvGet<AffiliateCommission[]>(KV_KEYS.affiliateCommissions, 'affiliate-commissions.json')) ?? []
  const allWithdrawals: AffiliateWithdrawal[] = (await kvGet<AffiliateWithdrawal[]>(KV_KEYS.affiliateWithdrawals, 'affiliate-withdrawals.json')) ?? []

  const { passwordHash: _, ...safe } = aff as Affiliate & { passwordHash: string }
  return NextResponse.json({
    affiliate: safe,
    commissions: allCommissions.filter(c => c.affiliateCode === code).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    withdrawals: allWithdrawals.filter(w => w.affiliateCode === code).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
  })
}
