import { NextRequest, NextResponse } from 'next/server'
import { markPaid } from '@/lib/orderStore'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[SePay webhook]', JSON.stringify(body))

    // SePay gửi: transferAmount, content, transferType, referenceCode, gateway...
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
