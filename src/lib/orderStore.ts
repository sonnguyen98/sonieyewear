// In-memory store cho đơn hàng chờ thanh toán
// Production: thay bằng Redis/Upstash

interface PendingOrder {
  code: string
  amount: number
  name: string
  paid: boolean
  paidAt?: string
  transactionRef?: string
  createdAt: number
}

declare global {
  // eslint-disable-next-line no-var
  var __orderStore: Map<string, PendingOrder> | undefined
}

const store: Map<string, PendingOrder> =
  globalThis.__orderStore ?? (globalThis.__orderStore = new Map())

export function createOrder(order: PendingOrder) {
  store.set(order.code, order)
  // Tự xoá sau 2 giờ
  setTimeout(() => store.delete(order.code), 2 * 60 * 60 * 1000)
}

export function getOrder(code: string) {
  return store.get(code)
}

export function markPaid(code: string, transactionRef: string) {
  const order = store.get(code)
  if (!order) return false
  order.paid = true
  order.paidAt = new Date().toLocaleString('vi-VN')
  order.transactionRef = transactionRef
  store.set(code, order)
  return true
}

export function generateOrderCode() {
  return 'SONI' + Date.now().toString().slice(-7)
}
