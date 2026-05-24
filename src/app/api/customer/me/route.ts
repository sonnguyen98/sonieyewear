import { NextRequest, NextResponse } from 'next/server'
import { getCustomerIdFromRequest } from '@/lib/customerAuth'
import { findCustomerById, stripPassword } from '@/lib/customerStore'

export async function GET(req: NextRequest) {
  const customerId = await getCustomerIdFromRequest(req)
  if (!customerId)
    return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  const customer = await findCustomerById(customerId)
  if (!customer)
    return NextResponse.json({ error: 'Tài khoản không tồn tại' }, { status: 404 })

  return NextResponse.json({ customer: stripPassword(customer) })
}
