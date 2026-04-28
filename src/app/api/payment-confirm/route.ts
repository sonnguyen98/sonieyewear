import { NextRequest, NextResponse } from 'next/server'
import { markPaid } from '@/lib/orderStore'
import { kvGet, kvSet, KV_KEYS } from '@/lib/kv-store'
import type { AffiliateCommission } from '@/app/api/affiliate/dashboard/route'
import type { Affiliate } from '@/app/api/affiliate/register/route'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const body = JSON.parse(rawBody)

    // SePay xác thực bằng API key trong header "apikey" (không phải HMAC)
    const secret = process.env.SEPAY_WEBHOOK_SECRET
    if (secret) {
      const apiKey = req.headers.get('apikey') ?? req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
      if (apiKey !== secret) {
        console.warn('[SePay] Invalid API key — request rejected')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    console.log('[SePay webhook]', JSON.stringify(body))

    const { content, transferAmount, transferType, referenceCode, id } = body

    // Chỉ xử lý tiền vào
    if (transferType !== 'in') {
      return NextResponse.json({ success: true })
    }

    // Tìm mã đơn hàng SONIXXXXXXX trong nội dung chuyển khoản
    const match = (content as string)?.match(/SONI\d{7}/i)
    if (!match) {
      console.log('[SePay] Không tìm thấy mã đơn trong:', content)
      return NextResponse.json({ success: true })
    }

    const orderCode = match[0].toUpperCase()
    const txRef = referenceCode || String(id)

    const updated = await markPaid(orderCode, txRef)
    console.log(`[SePay] ${orderCode} — ${updated ? '✓ Xác nhận thành công' : '⚠ Không tìm thấy đơn'} — ${transferAmount}đ`)

    // Tự động approve affiliate commission khi thanh toán thật đã vào
    if (updated) {
      await approveAffiliateCommission(orderCode)
    }

    // Thông báo lên Google Sheet
    const SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL
    if (SCRIPT_URL && updated) {
      fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'markPaid',
          orderCode,
          transactionRef: txRef,
          paidAmount: transferAmount,
          paidAt: new Date().toLocaleString('vi-VN'),
        }),
      }).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[SePay] Error:', err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

// Khi SePay xác nhận tiền vào → duyệt commission pending cho đơn đó
async function approveAffiliateCommission(orderCode: string) {
  try {
    const commissions: AffiliateCommission[] = (await kvGet<AffiliateCommission[]>(KV_KEYS.affiliateCommissions, 'affiliate-commissions.json')) ?? []
    const idx = commissions.findIndex(c => c.orderCode === orderCode && c.status === 'pending')
    if (idx === -1) return // Không có commission pending cho đơn này

    const commission = commissions[idx]
    commissions[idx] = { ...commission, status: 'approved', approvedAt: new Date().toISOString() }
    await kvSet(KV_KEYS.affiliateCommissions, 'affiliate-commissions.json', commissions)

    // Cộng tiền thật vào balance affiliate
    const affiliates: Affiliate[] = (await kvGet<Affiliate[]>(KV_KEYS.affiliates, 'affiliates.json')) ?? []
    const affIdx = affiliates.findIndex(a => a.code === commission.affiliateCode)
    if (affIdx === -1) return

    affiliates[affIdx] = {
      ...affiliates[affIdx],
      balance: affiliates[affIdx].balance + commission.commission,
      pendingBalance: Math.max(0, affiliates[affIdx].pendingBalance - commission.commission),
      totalEarned: affiliates[affIdx].totalEarned + commission.commission,
    }
    await kvSet(KV_KEYS.affiliates, 'affiliates.json', affiliates)
    console.log(`[Affiliate] Commission approved for ${orderCode}: +${commission.commission}đ → ${commission.affiliateCode}`)
  } catch (e) {
    console.error('[Affiliate] Error approving commission:', e)
  }
}
