import { NextRequest, NextResponse } from 'next/server'
import { checkAdminAuth } from '@/lib/adminAuth'
import { getAllCustomers, deleteCustomers } from '@/lib/customerStore'
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

// Xoá các tài khoản khách hàng không có đơn kính nào
export async function DELETE(req: NextRequest) {
  if (!await checkAdminAuth(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ids } = await req.json() as { ids?: string[] }
  if (!Array.isArray(ids) || ids.length === 0)
    return NextResponse.json({ error: 'Thiếu danh sách id' }, { status: 400 })

  const [customers, allPrescriptions] = await Promise.all([
    getAllCustomers(),
    kvGet<Prescription[]>(KV_KEYS.prescriptions, 'prescriptions.json').then(d => d ?? []),
  ])

  const customerIdsWithRx = new Set(allPrescriptions.map(rx => rx.customerId))
  const requestedIds = new Set(ids)
  // Chỉ xoá những tài khoản thực sự không có đơn kính, đề phòng dữ liệu client cũ
  const safeIds = customers
    .filter(c => requestedIds.has(c.id) && !customerIdsWithRx.has(c.id))
    .map(c => c.id)

  const removed = await deleteCustomers(safeIds)
  return NextResponse.json({ success: true, removed })
}
