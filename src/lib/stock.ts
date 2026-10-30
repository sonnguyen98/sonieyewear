import { kvGet, kvSet, withLock, KV_KEYS } from './kv-store'

export type StockMap = Record<string, { inStock: boolean; quantity: number }>

export interface DeductResult {
  success: boolean
  stock: StockMap
  decremented: string[]
  outOfStock: string[]
}

// Khoá 'stock:write' để tránh 2 đơn cùng lúc đọc chung 1 số tồn kho rồi cùng trừ
// (race condition) — có thể dẫn đến bán vượt tồn kho thật khi nhiều đơn trùng giờ.
export async function deductStock(variantIds: string[]): Promise<DeductResult> {
  return withLock('stock:write', async () => {
    const stock = (await kvGet<StockMap>(KV_KEYS.stock, 'stock.json')) ?? {}
    const decremented: string[] = []
    const outOfStock: string[] = []

    for (const vid of variantIds) {
      if (typeof vid !== 'string') continue
      if (!stock[vid] || stock[vid].quantity <= 0) {
        outOfStock.push(vid)
      } else {
        stock[vid].quantity -= 1
        if (stock[vid].quantity === 0) stock[vid].inStock = false
        decremented.push(vid)
      }
    }

    if (decremented.length > 0) await kvSet(KV_KEYS.stock, 'stock.json', stock)
    return { success: outOfStock.length === 0, stock, decremented, outOfStock }
  })
}
