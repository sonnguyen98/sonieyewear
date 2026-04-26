import { kvGet, KV_KEYS } from '@/lib/kv-store'
import { PRODUCTS, MERGED_PRODUCTS } from '@/data/products'
import type { Product } from '@/types/product'

type Override = Partial<Product> & { hidden?: boolean }

export async function getProducts(): Promise<Product[]> {
  try {
    const [overrides, newProducts, stock] = await Promise.all([
      kvGet<Record<string, Override>>(KV_KEYS.overrides, 'products-override.json'),
      kvGet<Product[]>(KV_KEYS.newProducts, 'new-products.json'),
      kvGet<Record<string, { inStock: boolean; quantity: number }>>(KV_KEYS.stock, 'stock.json'),
    ])

    const _overrides = overrides ?? {}
    const _newProducts = newProducts ?? []
    const _stock = stock ?? {}

    const applyStock = (p: Product): Product => ({
      ...p,
      colorVariants: p.colorVariants.map(v => {
        const s = _stock[v.id]
        return s ? { ...v, inStock: s.inStock } : v
      }),
    })

    return [
      ...PRODUCTS
        .filter(p => !_overrides[p.id]?.hidden)
        .map(p => applyStock({ ...p, ...(_overrides[p.id] ?? {}), lensPackages: p.lensPackages })),
      ..._newProducts
        .filter(p => !_overrides[p.id]?.hidden)
        .map(p => applyStock({ ...p, ...(_overrides[p.id] ?? {}) })),
    ]
  } catch {
    return MERGED_PRODUCTS
  }
}
