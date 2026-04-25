import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/orderStore'

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

    // Trừ tồn kho — variantIds từ body hoặc tìm theo productId
    if (body.variantIds?.length) {
      fetch(`${req.nextUrl.origin}/api/admin/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantIds: body.variantIds }),
      }).catch(() => {})
    }

    // Gửi lên Google Sheet
    if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes('paste_your')) {
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, action: 'newOrder' }),
        redirect: 'follow',
      }).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Order API error:', err)
    return NextResponse.json({ success: true })
  }
}
