import { NextRequest, NextResponse } from 'next/server'
import { findCustomerByPhone } from '@/lib/customerStore'
import { getPrescriptionsByCustomer } from '@/lib/prescriptionStore'
import { applyRateLimit, limiters, getClientIp } from '@/lib/ratelimit'

const PHONE_RE = /^0\d{9}$/

export async function GET(req: NextRequest) {
  const limited = await applyRateLimit(limiters.api, getClientIp(req))
  if (limited) return limited

  const phone = req.nextUrl.searchParams.get('phone')?.trim() ?? ''
  if (!PHONE_RE.test(phone))
    return NextResponse.json({ found: false })

  const customer = await findCustomerByPhone(phone)
  if (!customer)
    return NextResponse.json({ found: false })

  const prescriptions = await getPrescriptionsByCustomer(customer.id)
  if (prescriptions.length === 0)
    return NextResponse.json({ found: false })

  const latest = prescriptions[0]
  return NextResponse.json({
    found: true,
    examDate: latest.examDate,
    right: latest.right,
    left: latest.left,
    pd: latest.pd,
  })
}
