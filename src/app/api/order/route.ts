import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/orderStore'

// Google Apps Script trả 302 redirect tới /macros/echo — fetch sẽ tự follow GET,
// nhưng Apps Script vẫn xử lý doPost ở bước đầu, nên redirect: 'follow' (mặc định) là OK.
// Log chi tiết để debug khi đơn không lên Sheet.
async function postToScript(url: string, data: object) {
  const body = JSON.stringify(data)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      redirect: 'follow',
    })
    const text = await res.text()
    console.log('[Apps Script] status:', res.status, '| body:', text.slice(0, 500))
    if (!res.ok) {
      console.error('[Apps Script] FAILED — kiểm tra: 1) script có hàm doPost? 2) deploy "Anyone"? 3) đã New version sau khi sửa code?')
    }
    return { ok: res.ok, status: res.status, body: text }
  } catch (err) {
    console.error('[Apps Script] Network error:', err)
    return { ok: false, error: String(err) }
  }
}

export async function POST(req: NextRequest) {
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

    // Trừ tồn kho — chỉ màu đã chọn
    if (body.variantIds?.length) {
      fetch(`${req.nextUrl.origin}/api/admin/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantIds: body.variantIds }),
      }).catch(() => {})
    }

    // Gửi lên Google Sheet — PHẢI await để Vercel không kill trước khi hoàn thành
    if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes('paste_your')) {
      const r = await postToScript(APPS_SCRIPT_URL, { ...body, action: 'newOrder' })
      console.log('[Order] gửi sang Sheet:', r)
    } else {
      console.warn('[Order] GOOGLE_APPS_SCRIPT_URL chưa được set')
    }

    // Xử lý affiliate commission
    if (body.affiliateCode && body.orderAmount) {
      fetch(`${req.nextUrl.origin}/api/admin/affiliates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderCode: body.orderCode,
          customerName: body.name,
          affiliateCode: body.affiliateCode,
          orderAmount: body.orderAmount,
          paymentType: body.paymentType ?? 'cod',
        }),
      }).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Order API error:', err)
    return NextResponse.json({ success: true })
  }
}
