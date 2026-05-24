import { NextRequest, NextResponse } from 'next/server'
import { getCustomerIdFromRequest } from '@/lib/customerAuth'
import { deletePrescription } from '@/lib/prescriptionStore'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const customerId = await getCustomerIdFromRequest(req)
  if (!customerId)
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  const { id } = await params
  const result = await deletePrescription(id, customerId)

  if (!result.ok)
    return NextResponse.json({ error: result.error }, { status: result.error === 'Không có quyền xóa' ? 403 : 404 })

  return NextResponse.json({ success: true })
}
