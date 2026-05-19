import { NextResponse } from 'next/server'
import { kvGet, KV_KEYS } from '@/lib/kv-store'
import { PRODUCTS, MERGED_PRODUCTS } from '@/data/products'
import type { Product } from '@/types/product'
import { LENS_PACKAGES } from '@/data/lens-packages'

type Override = Partial<Product> & { hidden?: boolean }

export async function GET() {
  try {
    const overrides = (await kvGet<Record<string, Override>>(KV_KEYS.overrides, 'products-override.json')) ?? {}
    const newProducts = (await kvGet<Product[]>(KV_KEYS.newProducts, 'new-products.json')) ?? []
    const stock = (await kvGet<Record<string, { inStock: boolean; quantity: number }>>(KV_KEYS.stock, 'stock.json')) ?? {}

    const applyStock = (p: Product): Product => ({
      ...p,
      colorVariants: p.colorVariants.map(v => {
        const s = stock[v.id]
        return s ? { ...v, inStock: s.inStock } : v
      }),
    })

    const allProducts: Product[] = [
      ...PRODUCTS
        .filter(p => !overrides[p.id]?.hidden)
        .map(p => applyStock({ ...p, ...(overrides[p.id] ?? {}), lensPackages: p.lensPackages })),
      ...newProducts
        .filter(p => !overrides[p.id]?.hidden)
        .map(p => applyStock({ ...p, ...(overrides[p.id] ?? {}) })),
    ]

    return NextResponse.json(allProducts, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
    })
  } catch {
    // Fallback về static data nếu KV lỗi
    return NextResponse.json(MERGED_PRODUCTS, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
    })
  }
}
