import { NextRequest, NextResponse } from 'next/server'
import { findAffiliateByCodeAndPhone, getAllCommissions, getAllWithdrawals } from '@/lib/affiliateStore'

// Re-export types cho module cũ
export type { AffiliateCommission, AffiliateWithdrawal } from '@/lib/affiliateStore'

export async function GET(req: NextRequest) {
  const code = req.headers.get('x-affiliate-code')
  const phone = req.headers.get('x-affiliate-phone')
  if (!code || !phone) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const aff = await findAffiliateByCodeAndPhone(code, phone)
  if (!aff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [allCommissions, allWithdrawals] = await Promise.all([
    getAllCommissions(),
    getAllWithdrawals(),
  ])

  const { passwordHash: _, ...safe } = aff
  return NextResponse.json({
    affiliate: safe,
    commissions: allCommissions
      .filter(c => c.affiliateCode === code)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    withdrawals: allWithdrawals
      .filter(w => w.affiliateCode === code)
      .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
  })
}
