import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/adminAuth'
import { getAllCustomers } from '@/lib/customerStore'
import { kvGet, KV_KEYS } from '@/lib/kv-store'
import type { Prescription } from '@/lib/prescriptionStore'

export async function GET(req: NextRequest) {
  if (!await checkAdminAuth(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [customers, allPrescriptions] = await Promise.all([
    getAllCustomers(),
    kvGet<Prescription[]>(KV_KEYS.prescriptions, 'prescriptions.json').then(d => d ?? []),
  ])

  // Nhóm đơn kính theo customerId
  const rxMap = new Map<string, Prescription[]>()
  for (const rx of allPrescriptions) {
    const list = rxMap.get(rx.customerId) ?? []
    list.push(rx)
    rxMap.set(rx.customerId, list)
  }

  const data = customers.map(c => ({
    ...c,
    prescriptions: (rxMap.get(c.id) ?? []).sort((a, b) => b.examDate.localeCompare(a.examDate)),
  }))

  // Mới đăng ký trước
  data.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return NextResponse.json({ customers: data })
}
