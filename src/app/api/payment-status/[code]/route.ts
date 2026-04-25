import { NextRequest, NextResponse } from 'next/server'
import { getOrder } from '@/lib/orderStore'

export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  const order = getOrder(params.code)
  if (!order) return NextResponse.json({ found: false })
  return NextResponse.json({
    found: true,
    paid: order.paid,
    paidAt: order.paidAt,
    transactionRef: order.transactionRef,
  })
}
