import { kvGet, kvSet, withLock, KV_KEYS } from './kv-store'

// ── Types ────────────────────────────────────────────────────────────────────
export interface Customer {
  id: string
  name?: string
  email?: string
  phone: string
  createdAt: string
  dob?: string
  tags?: string[]
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

// ── Xoá ──────────────────────────────────────────────────────────────────────
export async function deleteCustomers(ids: string[]): Promise<number> {
  return withLock('customer:write', async () => {
    const list = await getAllCustomers()
    const idSet = new Set(ids)
    const remaining = list.filter(c => !idSet.has(c.id))
    const removed = list.length - remaining.length
    if (removed > 0) await kvSet(KV_KEYS.customers, 'customers.json', remaining)
    return removed
  })
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ── Truy cập bằng số điện thoại (không cần mật khẩu) ─────────────────────────
// Nếu khách đã tồn tại, bổ sung tên/email còn thiếu (không ghi đè giá trị đã có).
export async function findOrCreateCustomerByPhone(phone: string, name?: string, email?: string): Promise<Customer> {
  return withLock('customer:write', async () => {
    const list = await getAllCustomers()
    const trimmedPhone = phone.trim()
    const trimmedName = name?.trim()
    const trimmedEmail = email?.trim().toLowerCase()
    const validEmail = trimmedEmail && EMAIL_RE.test(trimmedEmail) ? trimmedEmail : undefined

    const idx = list.findIndex(c => c.phone === trimmedPhone)
    if (idx !== -1) {
      const existing = list[idx]
      const updated: Customer = {
        ...existing,
        ...(trimmedName && !existing.name ? { name: trimmedName } : {}),
        ...(validEmail && !existing.email ? { email: validEmail } : {}),
      }
      if (updated.name !== existing.name || updated.email !== existing.email) {
        list[idx] = updated
        await kvSet(KV_KEYS.customers, 'customers.json', list)
      }
      return updated
    }

    const customer: Customer = {
      id: 'cust-' + Date.now(),
      phone: trimmedPhone,
      createdAt: new Date().toISOString(),
      ...(trimmedName ? { name: trimmedName } : {}),
      ...(validEmail ? { email: validEmail } : {}),
    }

    await kvSet(KV_KEYS.customers, 'customers.json', [...list, customer])
    return customer
  })
}

export async function addTagToCustomer(id: string, tag: string): Promise<void> {
  await withLock('customer:write', async () => {
    const list = await getAllCustomers()
    const idx = list.findIndex(c => c.id === id)
    if (idx === -1) return
    const existing = list[idx]
    if (existing.tags?.includes(tag)) return
    list[idx] = { ...existing, tags: [...(existing.tags ?? []), tag] }
    await kvSet(KV_KEYS.customers, 'customers.json', list)
  })
}
