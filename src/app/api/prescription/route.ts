import { NextRequest, NextResponse } from 'next/server'
import { getCustomerIdFromRequest } from '@/lib/customerAuth'
import { getPrescriptionsByCustomer, createPrescription } from '@/lib/prescriptionStore'

export async function GET(req: NextRequest) {
  const customerId = await getCustomerIdFromRequest(req)
  if (!customerId)
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  const prescriptions = await getPrescriptionsByCustomer(customerId)
  return NextResponse.json({ prescriptions })
}

export async function POST(req: NextRequest) {
  const customerId = await getCustomerIdFromRequest(req)
  if (!customerId)
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const body = await req.json()
    const { examDate, clinicName, right, left, pd, notes } = body

    if (!examDate || !right || !left)
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })

    const result = await createPrescription({
      customerId,
      examDate,
      clinicName,
      right,
      left,
      pd,
      notes,
    })

    if (!result.ok)
      return NextResponse.json({ error: result.error }, { status: 400 })

    return NextResponse.json({ success: true, prescription: result.prescription }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 })
  }
}
