'use client'

import { useState, useEffect } from 'react'

type StockMap = Record<string, { inStock: boolean; quantity: number }>

let cache: StockMap | null = null
let cacheTime = 0
let fetchPromise: Promise<StockMap> | null = null
const TTL = 10_000 // 10 giây — cập nhật nhanh hơn sau mỗi đơn hàng

async function fetchStock(): Promise<StockMap> {
  const now = Date.now()
  // Dùng cache nếu còn trong 30 giây
  if (cache && now - cacheTime < TTL) return cache
  if (fetchPromise) return fetchPromise
  fetchPromise = fetch('/api/stock')
    .then(r => r.json())
    .then(d => { cache = d; cacheTime = Date.now(); fetchPromise = null; return d })
    .catch(() => { fetchPromise = null; return cache ?? {} })
  return fetchPromise
}

export function invalidateStockCache() { cache = null; cacheTime = 0; fetchPromise = null }

export function useStock() {
  const [stock, setStock] = useState<StockMap>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetchStock().then(s => { setStock(s); setLoaded(true) })
  }, [])

  function getVariantStock(variantId: string, defaultInStock = true): { inStock: boolean; quantity: number } {
    // Nếu chưa load xong KV → dùng default từ product data
    if (!loaded) return { inStock: defaultInStock, quantity: 99 }
    // Nếu không có entry trong KV → coi là còn hàng (chưa set tồn kho)
    return stock[variantId] ?? { inStock: true, quantity: 99 }
  }

  function isProductAvailable(variantIds: string[], defaults: boolean[]): boolean {
    // Chưa load → coi là available để tránh ẩn sản phẩm sai
    if (!loaded) return true
    // Có ít nhất 1 màu còn hàng
    return variantIds.some((id) => {
      const s = stock[id]
      // Không có entry KV → còn hàng
      return !s || s.inStock
    })
  }

  function getProductQuantity(variantIds: string[]): number {
    if (!loaded) return 99
    return variantIds.reduce((sum, id) => sum + (stock[id]?.quantity ?? 99), 0)
  }

  return { stock, loaded, getVariantStock, isProductAvailable, getProductQuantity }
}
