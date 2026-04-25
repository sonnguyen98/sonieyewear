'use client'

import { useState, useEffect } from 'react'

type StockMap = Record<string, { inStock: boolean; quantity: number }>

let cache: StockMap | null = null
let fetchPromise: Promise<StockMap> | null = null

async function fetchStock(): Promise<StockMap> {
  if (cache) return cache
  if (fetchPromise) return fetchPromise
  fetchPromise = fetch('/api/stock').then(r => r.json()).then(d => { cache = d; return d })
  return fetchPromise
}

// Xoá cache để force refresh sau khi đặt hàng
export function invalidateStockCache() { cache = null; fetchPromise = null }

export function useStock() {
  const [stock, setStock] = useState<StockMap>({})

  useEffect(() => {
    fetchStock().then(setStock)
  }, [])

  function getVariantStock(variantId: string, defaultInStock = true): { inStock: boolean; quantity: number } {
    return stock[variantId] ?? { inStock: defaultInStock, quantity: 99 }
  }

  function isProductAvailable(variantIds: string[], defaults: boolean[]): boolean {
    return variantIds.some((id, i) => getVariantStock(id, defaults[i]).inStock)
  }

  function getProductQuantity(variantIds: string[]): number {
    return variantIds.reduce((sum, id) => sum + (stock[id]?.quantity ?? 99), 0)
  }

  return { stock, getVariantStock, isProductAvailable, getProductQuantity }
}
