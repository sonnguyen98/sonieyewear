// Order store dùng Vercel KV (production) hoặc in-memory (development)
import { kvGet, kvSet } from './kv-store'

interface PendingOrder {
  code: string
  amount: number
  name: string
  paid: boolean
  paidAt?: string
  transactionRef?: string
  createdAt: number
}

const IS_PROD = process.env.NODE_ENV === 'production'

// ── Dev: in-memory ────────────────────────────────────────────────────────────
declare global {
  // eslint-disable-next-line no-var
  var __orderStore: Map<string, PendingOrder> | undefined
}
const memStore: Map<string, PendingOrder> =
  globalThis.__orderStore ?? (globalThis.__orderStore = new Map())

// ── Helpers ───────────────────────────────────────────────────────────────────
async function getAllOrders(): Promise<Record<string, PendingOrder>> {
  if (!IS_PROD) {
    const obj: Record<string, PendingOrder> = {}
    memStore.forEach((v, k) => { obj[k] = v })
    return obj
  }
  return (await kvGet<Record<string, PendingOrder>>('pending-orders', '')) ?? {}
}

async function saveAllOrders(orders: Record<string, PendingOrder>): Promise<void> {
  if (!IS_PROD) {
    Object.entries(orders).forEach(([k, v]) => memStore.set(k, v))
    return
  }
  await kvSet('pending-orders', '', orders)
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function createOrder(order: PendingOrder) {
  const orders = await getAllOrders()
  orders[order.code] = order
  await saveAllOrders(orders)
}

export async function getOrder(code: string): Promise<PendingOrder | undefined> {
  const orders = await getAllOrders()
  return orders[code]
}

export async function markPaid(code: string, transactionRef: string): Promise<boolean> {
  const orders = await getAllOrders()
  const order = orders[code]
  if (!order) return false
  order.paid = true
  order.paidAt = new Date().toLocaleString('vi-VN')
  order.transactionRef = transactionRef
  orders[code] = order
  await saveAllOrders(orders)
  return true
}

export function generateOrderCode() {
  return 'SONI' + Date.now().toString().slice(-7)
}
