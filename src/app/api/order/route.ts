import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/orderStore'

// Google Apps Script redirect 302 POST→GET làm mất body
// Cần follow redirect thủ công để giữ method POST + body
async function postToScript(url: string, data: object) {
  const body = JSON.stringify(data)
  try {
    const r1 = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      redirect: 'manual', // không auto-follow
    })
    // Nếu bị redirect → follow thủ công dưới dạng POST
    if (r1.status >= 300 && r1.status < 400) {
      const location = r1.headers.get('location') ?? ''
      if (location) {
        await fetch(location, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        })
      }
    }
  } catch {}
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

    // Gửi lên Google Sheet — fix redirect POST→POST
    if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes('paste_your')) {
      postToScript(APPS_SCRIPT_URL, { ...body, action: 'newOrder' }).catch(() => {})
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
