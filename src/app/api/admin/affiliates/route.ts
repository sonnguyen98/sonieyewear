import { NextRequest, NextResponse } from 'next/server'
import { kvGet, kvSet, KV_KEYS } from '@/lib/kv-store'
import { checkAdminAuth } from '@/lib/adminAuth'
import type { Affiliate } from '@/app/api/affiliate/register/route'
import type { AffiliateCommission, AffiliateWithdrawal } from '@/app/api/affiliate/dashboard/route'

const COMMISSION_RATE = 0.10

// GET: toàn bộ dữ liệu affiliate
export async function GET(req: NextRequest) {
  if (!await checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [affiliates, commissions, withdrawals] = await Promise.all([
    kvGet<Affiliate[]>(KV_KEYS.affiliates, 'affiliates.json'),
    kvGet<AffiliateCommission[]>(KV_KEYS.affiliateCommissions, 'affiliate-commissions.json'),
    kvGet<AffiliateWithdrawal[]>(KV_KEYS.affiliateWithdrawals, 'affiliate-withdrawals.json'),
  ])

  return NextResponse.json({
    affiliates: (affiliates ?? []).map(({ passwordHash: _, ...a }) => a),
    commissions: (commissions ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    withdrawals: (withdrawals ?? []).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
  })
}

// PUT: các hành động admin
export async function PUT(req: NextRequest) {
  if (!await checkAdminAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action, ...payload } = await req.json()

  // Xác nhận giao hàng COD → duyệt commission pending
  if (action === 'approve-commission') {
    const { commissionId } = payload
    const commissions: AffiliateCommission[] = (await kvGet<AffiliateCommission[]>(KV_KEYS.affiliateCommissions, 'affiliate-commissions.json')) ?? []
    const idx = commissions.findIndex(c => c.id === commissionId)
    if (idx === -1) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 })

    const commission = commissions[idx]
    if (commission.status === 'approved') return NextResponse.json({ error: 'Đã duyệt rồi' }, { status: 400 })

    commissions[idx] = { ...commission, status: 'approved', approvedAt: new Date().toISOString() }
    await kvSet(KV_KEYS.affiliateCommissions, 'affiliate-commissions.json', commissions)

    // Cộng tiền vào tài khoản affiliate
    const affiliates: Affiliate[] = (await kvGet<Affiliate[]>(KV_KEYS.affiliates, 'affiliates.json')) ?? []
    const affIdx = affiliates.findIndex(a => a.code === commission.affiliateCode)
    if (affIdx !== -1) {
      affiliates[affIdx] = {
        ...affiliates[affIdx],
        balance: affiliates[affIdx].balance + commission.commission,
        pendingBalance: Math.max(0, affiliates[affIdx].pendingBalance - commission.commission),
        totalEarned: affiliates[affIdx].totalEarned + commission.commission,
      }
      await kvSet(KV_KEYS.affiliates, 'affiliates.json', affiliates)
    }
    return NextResponse.json({ success: true })
  }

  // Đánh dấu đã chuyển khoản cho lệnh rút
  if (action === 'mark-paid') {
    const { withdrawalId } = payload
    const withdrawals: AffiliateWithdrawal[] = (await kvGet<AffiliateWithdrawal[]>(KV_KEYS.affiliateWithdrawals, 'affiliate-withdrawals.json')) ?? []
    const idx = withdrawals.findIndex(w => w.id === withdrawalId)
    if (idx === -1) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 })
    withdrawals[idx] = { ...withdrawals[idx], status: 'paid', paidAt: new Date().toISOString() }
    await kvSet(KV_KEYS.affiliateWithdrawals, 'affiliate-withdrawals.json', withdrawals)
    return NextResponse.json({ success: true })
  }

  // Khoá/mở tài khoản affiliate
  if (action === 'toggle-status') {
    const { affiliateId } = payload
    const affiliates: Affiliate[] = (await kvGet<Affiliate[]>(KV_KEYS.affiliates, 'affiliates.json')) ?? []
    const idx = affiliates.findIndex(a => a.id === affiliateId)
    if (idx === -1) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 })
    affiliates[idx] = { ...affiliates[idx], status: affiliates[idx].status === 'active' ? 'suspended' : 'active' }
    await kvSet(KV_KEYS.affiliates, 'affiliates.json', affiliates)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Action không hợp lệ' }, { status: 400 })
}

// POST: tạo commission khi có đơn hàng (gọi nội bộ từ order API)
export async function POST(req: NextRequest) {
  const { orderCode, customerName, affiliateCode, orderAmount, paymentType } = await req.json()
  if (!affiliateCode || !orderCode) return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })

  const affiliates: Affiliate[] = (await kvGet<Affiliate[]>(KV_KEYS.affiliates, 'affiliates.json')) ?? []
  const aff = affiliates.find(a => a.code === affiliateCode && a.status === 'active')
  if (!aff) return NextResponse.json({ error: 'Affiliate không tồn tại' }, { status: 404 })

  const commission = Math.round(orderAmount * COMMISSION_RATE)
  // Commission luôn PENDING khi tạo đơn — chỉ APPROVED sau khi tiền thực sự vào tài khoản
  // (SePay webhook xác nhận thanh toán, hoặc admin duyệt COD)
  const status = 'pending' as const

  const commissions: AffiliateCommission[] = (await kvGet<AffiliateCommission[]>(KV_KEYS.affiliateCommissions, 'affiliate-commissions.json')) ?? []

  // Chặn duplicate: mỗi orderCode chỉ được tạo commission một lần
  if (commissions.some(c => c.orderCode === orderCode)) {
    return NextResponse.json({ success: true, skipped: 'duplicate' })
  }

  const newCommission: AffiliateCommission = {
    id: 'cm-' + Date.now(),
    affiliateCode, orderCode, customerName,
    orderAmount, commission, paymentType, status,
    createdAt: new Date().toISOString(),
  }
  await kvSet(KV_KEYS.affiliateCommissions, 'affiliate-commissions.json', [...commissions, newCommission])

  // Commission luôn pending → cộng vào pendingBalance
  const affIdx = affiliates.findIndex(a => a.code === affiliateCode)
  affiliates[affIdx] = { ...affiliates[affIdx], pendingBalance: affiliates[affIdx].pendingBalance + commission }
  await kvSet(KV_KEYS.affiliates, 'affiliates.json', affiliates)

  return NextResponse.json({ success: true, commission: newCommission })
}
