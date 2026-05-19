import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/adminAuth'
import {
  getAllAffiliates, getAllCommissions, getAllWithdrawals,
  approveCommissionById, markWithdrawalPaid, toggleAffiliateStatus,
  createAffiliateCommission,
} from '@/lib/affiliateStore'

// GET: toàn bộ dữ liệu affiliate
export async function GET(req: NextRequest) {
  if (!await checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [affiliates, commissions, withdrawals] = await Promise.all([
    getAllAffiliates(),
    getAllCommissions(),
    getAllWithdrawals(),
  ])

  return NextResponse.json({
    affiliates: affiliates.map(({ passwordHash: _, ...a }) => a),
    commissions: commissions.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    withdrawals: withdrawals.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
  })
}

// PUT: các hành động admin
export async function PUT(req: NextRequest) {
  if (!await checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, ...payload } = await req.json()

  if (action === 'approve-commission') {
    const result = await approveCommissionById(payload.commissionId)
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.error === 'Không tìm thấy' ? 404 : 400 })
    return NextResponse.json({ success: true })
  }

  if (action === 'mark-paid') {
    const result = await markWithdrawalPaid(payload.withdrawalId)
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 404 })
    return NextResponse.json({ success: true })
  }

  if (action === 'toggle-status') {
    const result = await toggleAffiliateStatus(payload.affiliateId)
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 404 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Action không hợp lệ' }, { status: 400 })
}

// POST: backward-compat — chỉ admin được phép tạo commission qua endpoint này.
// Order route gọi createAffiliateCommission() trực tiếp, không qua HTTP.
export async function POST(req: NextRequest) {
  if (!await checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { orderCode, customerName, affiliateCode, orderAmount, paymentType } = await req.json()
  if (!affiliateCode || !orderCode) return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })

  const result = await createAffiliateCommission({
    orderCode, customerName, affiliateCode, orderAmount,
    paymentType: paymentType ?? 'cod',
  })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 404 })
  return NextResponse.json({ success: true, ...result })
}
