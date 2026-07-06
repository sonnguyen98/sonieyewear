import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/adminAuth'
import { getAllCustomers } from '@/lib/customerStore'
import { postToSheet } from '@/lib/googleSheet'

export async function POST(req: NextRequest) {
  if (!await checkAdminAuth(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const customers = await getAllCustomers()

  await postToSheet({
    action: 'syncAllCustomers',
    customers: customers.map(c => ({
      phone: c.phone,
      name: c.name ?? '',
      email: c.email ?? '',
      createdAt: c.createdAt,
      note: c.tags?.join(', ') ?? '',
    })),
  })

  return NextResponse.json({ success: true, count: customers.length })
}
