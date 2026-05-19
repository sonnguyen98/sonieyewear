import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/orderStore'
import { deductStock } from '@/lib/stock'
import { createAffiliateCommission } from '@/lib/affiliateStore'
import { applyRateLimit, limiters, getClientIp } from '@/lib/ratelimit'

// Google Apps Script trả 302 redirect — Node.js tự đổi POST→GET làm mất body.
// Dùng redirect:'manual' → lấy Location header → POST lại thủ công giữ body.
async function postToScript(url: string, data: object) {
  const body = JSON.stringify(data)
  try {
    // Bước 1: POST tới script.google.com — sẽ nhận 302 redirect
    const r1 = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      redirect: 'manual',
    })
    console.log('[Script] step1 status:', r1.status, '| type:', r1.type)

    // Bước 2: Lấy Location và POST lại (giữ body)
    const location = r1.headers.get('location') ?? ''
    console.log('[Script] redirect to:', location?.slice(0, 80))

    if (location) {
      // Echo URL chỉ nhận GET để lấy response — doPost đã chạy ở bước 1
      const r2 = await fetch(location, { method: 'GET' })
      const text = await r2.text()
      console.log('[Script] step2 status:', r2.status, '| body:', text.slice(0, 200))
      return { ok: r2.ok, status: r2.status }
    }

    // Nếu không redirect → thử luôn response đầu tiên
    if (r1.status === 200) {
      return { ok: true, status: 200 }
    }
    return { ok: false, status: r1.status, note: 'no location header' }
  } catch (err) {
    console.error('[Script] Error:', err)
    return { ok: false, error: String(err) }
  }
}

export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(limiters.order, getClientIp(req))
  if (limited) return limited

  const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL

  try {
    const body = await req.json()

    // Lưu đơn vào store để SePay có thể match
    if (body.orderCode && body.payAmount) {
      await createOrder({
        code: body.orderCode,
        amount: body.payAmount,
        name: body.name,
        paid: false,
        createdAt: Date.now(),
      })
    }

    // Trừ tồn kho — kiểm tra trước, từ chối nếu hết hàng
    if (body.variantIds?.length) {
      const result = await deductStock(body.variantIds)
      if (result.outOfStock.length > 0) {
        return NextResponse.json({ success: false, error: 'out_of_stock' }, { status: 409 })
      }
    }

    // Gửi lên Google Sheet — PHẢI await để Vercel không kill trước khi hoàn thành
    if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes('paste_your')) {
      const r = await postToScript(APPS_SCRIPT_URL, { ...body, action: 'newOrder' })
      console.log('[Order] gửi sang Sheet:', r)
    } else {
      console.warn('[Order] GOOGLE_APPS_SCRIPT_URL chưa được set')
    }

    // Xử lý affiliate commission — PHẢI await để Vercel không kill trước khi ghi xong
    if (body.affiliateCode && body.orderAmount) {
      try {
        await createAffiliateCommission({
          orderCode: body.orderCode,
          customerName: body.name,
          affiliateCode: body.affiliateCode,
          orderAmount: body.orderAmount,
          paymentType: body.paymentType ?? 'cod',
        })
      } catch (err) {
        console.error('[Order] affiliate commission error:', err)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Order API error:', err)
    return NextResponse.json({ success: true })
  }
}
