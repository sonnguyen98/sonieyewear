import { kvGet, kvSet, withLock, KV_KEYS } from './kv-store'

// ── Types ────────────────────────────────────────────────────────────────────
export interface Customer {
  id: string
  name?: string
  email?: string
  phone: string
  createdAt: string
  dob?: string
}

// ── Read ops ─────────────────────────────────────────────────────────────────
export async function getAllCustomers(): Promise<Customer[]> {
  return (await kvGet<Customer[]>(KV_KEYS.customers, 'customers.json')) ?? []
}

export async function findCustomerById(id: string): Promise<Customer | null> {
  const list = await getAllCustomers()
  return list.find(c => c.id === id) ?? null
}

export async function findCustomerByPhone(phone: string): Promise<Customer | null> {
  const list = await getAllCustomers()
  return list.find(c => c.phone === phone) ?? null
}

// ── Truy cập bằng số điện thoại (không cần mật khẩu) ─────────────────────────
export async function findOrCreateCustomerByPhone(phone: string, name?: string): Promise<Customer> {
  return withLock('customer:write', async () => {
    const list = await getAllCustomers()
    const trimmedPhone = phone.trim()

    const existing = list.find(c => c.phone === trimmedPhone)
    if (existing) return existing

    const customer: Customer = {
      id: 'cust-' + Date.now(),
      phone: trimmedPhone,
      createdAt: new Date().toISOString(),
      ...(name?.trim() ? { name: name.trim() } : {}),
    }

    await kvSet(KV_KEYS.customers, 'customers.json', [...list, customer])
    return customer
  })
}
