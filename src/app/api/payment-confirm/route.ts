import { NextRequest, NextResponse } from 'next/server'
import { markPaid } from '@/lib/orderStore'
import { approveCommissionByOrderCode } from '@/lib/affiliateStore'
import { applyRateLimit, limiters, getClientIp } from '@/lib/ratelimit'

async function postToAppsScript(url: string, data: object) {
  const body = JSON.stringify(data)
  const r1 = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, redirect: 'manual' })
  if (r1.status >= 300 && r1.status < 400) {
    const loc = r1.headers.get('location') ?? ''
    if (loc) await fetch(loc, { method: 'GET' }) // echo URL chỉ nhận GET
  }
}

export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(limiters.paymentWebhook, getClientIp(req))
  if (limited) return limited

  try {
    const rawBody = await req.text()
    const body = JSON.parse(rawBody)

    // Fail-closed: webhook BẮT BUỘC có secret. Nếu env thiếu → từ chối toàn bộ.
    const secret = process.env.SEPAY_WEBHOOK_SECRET
    if (!secret) {
      console.error('[SePay] SEPAY_WEBHOOK_SECRET chưa cấu hình — từ chối webhook')
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 503 })
    }

    const authHeader = req.headers.get('Authorization') ?? ''
    let receivedKey = req.headers.get('apikey') ?? ''
    if (!receivedKey && authHeader.toLowerCase().startsWith('apikey ')) {
      receivedKey = authHeader.slice(7).trim()
    } else if (!receivedKey && authHeader.toLowerCase().startsWith('bearer ')) {
      receivedKey = authHeader.slice(7).trim()
    }

    if (!receivedKey || receivedKey !== secret) {
      console.warn('[SePay] Invalid/missing API key — rejected')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      try {
        const ok = await approveCommissionByOrderCode(orderCode, transferAmount)
        if (ok) console.log(`[Affiliate] approved commission for ${orderCode}`)
      } catch (e) {
        console.error('[Affiliate] approve error:', e)
      }
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
