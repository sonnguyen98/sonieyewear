import { NextRequest, NextResponse } from 'next/server'
import { markPaid } from '@/lib/orderStore'

async function postToAppsScript(url: string, data: object) {
  const body = JSON.stringify(data)
  const r1 = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, redirect: 'manual' })
  if (r1.status >= 300 && r1.status < 400) {
    const loc = r1.headers.get('location') ?? ''
    if (loc) await fetch(loc, { method: 'GET' }) // echo URL chỉ nhận GET
  }
}
import { kvGet, kvSet, KV_KEYS } from '@/lib/kv-store'
import type { AffiliateCommission } from '@/app/api/affiliate/dashboard/route'
import type { Affiliate } from '@/app/api/affiliate/register/route'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const body = JSON.parse(rawBody)

    // SePay gửi: Authorization: Apikey <key>  (không phải Bearer)
    const secret = process.env.SEPAY_WEBHOOK_SECRET
    if (secret) {
      const authHeader = req.headers.get('Authorization') ?? ''
      // Hỗ trợ cả "Apikey xxx" và "Bearer xxx" và header "apikey" riêng
      let receivedKey = req.headers.get('apikey') ?? ''
      if (!receivedKey && authHeader.toLowerCase().startsWith('apikey ')) {
        receivedKey = authHeader.slice(7).trim()
      } else if (!receivedKey && authHeader.toLowerCase().startsWith('bearer ')) {
        receivedKey = authHeader.slice(7).trim()
      }

      if (receivedKey && receivedKey !== secret) {
        console.warn('[SePay] Invalid API key — rejected. Received:', receivedKey)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    console.log('[SePay webhook]', JSON.stringify(body))

    // SePay có thể gửi "content" hoặc "description" tuỳ phiên bản
    const transferContent: string = body.content ?? body.description ?? ''
    const transferAmount: number = body.transferAmount ?? body.amount ?? 0
    const referenceCode: string = body.referenceCode ?? body.reference ?? ''
    const transferId: string = String(body.id ?? '')
    // transferType: "in" = tiền vào, "out" = tiền ra; nếu không có → mặc định là "in"
    const transferType: string = body.transferType ?? 'in'

    if (transferType !== 'in') {
      return NextResponse.json({ success: true })
    }

    // Tìm mã đơn hàng SONIXXXXXXX trong nội dung chuyển khoản
    const match = transferContent.match(/SONI\d{7}/i)
    if (!match) {
      console.log('[SePay] Không tìm thấy mã đơn trong:', transferContent)
      return NextResponse.json({ success: true })
    }

    const orderCode = match[0].toUpperCase()
    const txRef = referenceCode || transferId

    const updated = await markPaid(orderCode, txRef)
    console.log(`[SePay] ${orderCode} — ${updated ? '✓ Xác nhận thành công' : '⚠ Không tìm thấy đơn'} — ${transferAmount}đ`)

    // Tự động approve affiliate commission khi tiền thật đã vào
    if (updated) {
      await approveAffiliateCommission(orderCode)
    }

    // Thông báo lên Google Sheet — PHẢI await để Vercel không kill trước khi hoàn thành
    const SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL
    if (SCRIPT_URL && updated) {
      await postToAppsScript(SCRIPT_URL, {
        action: 'markPaid',
        orderCode,
        transactionRef: txRef,
        paidAmount: transferAmount,
        paidAt: new Date().toLocaleString('vi-VN'),
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[SePay] Error:', err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

async function approveAffiliateCommission(orderCode: string) {
  try {
    const commissions: AffiliateCommission[] = (await kvGet<AffiliateCommission[]>(KV_KEYS.affiliateCommissions, 'affiliate-commissions.json')) ?? []
    const idx = commissions.findIndex(c => c.orderCode === orderCode && c.status === 'pending')
    if (idx === -1) return

    const commission = commissions[idx]
    commissions[idx] = { ...commission, status: 'approved', approvedAt: new Date().toISOString() }
    await kvSet(KV_KEYS.affiliateCommissions, 'affiliate-commissions.json', commissions)

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
    console.log(`[Affiliate] +${commission.commission}đ → ${commission.affiliateCode} (${orderCode})`)
  } catch (e) {
    console.error('[Affiliate] Error approving commission:', e)
  }
}
