import { NextRequest, NextResponse } from 'next/server'
import { findOrCreateCustomerByPhone } from '@/lib/customerStore'
import { postToSheet } from '@/lib/googleSheet'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, phone, email, source } = body

  if (!name || !phone) {
    return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })
  }

  try {
    const customer = await findOrCreateCustomerByPhone(phone, name, email ?? '')

    await postToSheet({
      action: 'syncCustomer',
      phone: customer.phone,
      name: name,
      email: email ?? '',
      source: source ?? 'LP Gift',
      createdAt: customer.createdAt,
    })

    return NextResponse.json({ success: true, customerId: customer.id })
  } catch (err) {
    console.error('[gift-lead] error:', err)
    return NextResponse.json({ error: 'Lỗi hệ thống' }, { status: 500 })
  }
}
