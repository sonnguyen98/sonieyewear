import { NextRequest, NextResponse } from 'next/server'
import { findOrCreateCustomerByPhone, addTagToCustomer } from '@/lib/customerStore'
import { postToSheet } from '@/lib/googleSheet'

const GIFT_TAG = 'Khách nhận quà'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, phone, email, source } = body

  if (!name || !phone) {
    return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })
  }

  try {
    const customer = await findOrCreateCustomerByPhone(phone, name, email ?? '')

    await addTagToCustomer(customer.id, GIFT_TAG)

    await postToSheet({
      action: 'syncCustomer',
      phone: customer.phone,
      name: name,
      email: email ?? '',
      source: `Nhận Quà | ${source ?? 'LP Gift'}`,
      note: GIFT_TAG,
      createdAt: customer.createdAt,
    })

    return NextResponse.json({ success: true, customerId: customer.id })
  } catch (err) {
    console.error('[gift-lead] error:', err)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
