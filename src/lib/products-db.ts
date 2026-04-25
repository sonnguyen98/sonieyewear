import fs from 'fs'
import path from 'path'
import { MERGED_PRODUCTS } from '@/data/products'
import type { Product } from '@/types/product'

const OVERRIDE_FILE = path.join(process.cwd(), 'src', 'data', 'products-override.json')
const STOCK_FILE    = path.join(process.cwd(), 'src', 'data', 'stock.json')

type StockMap   = Record<string, { inStock: boolean; quantity: number }>
type Override   = Partial<Omit<Product, 'lensPackages'>>
type OverrideMap= Record<string, Override & { hidden?: boolean }>

function readStock(): StockMap {
  try { return JSON.parse(fs.readFileSync(STOCK_FILE, 'utf-8')) } catch { return {} }
}

function readOverrides(): OverrideMap {
  try {
    if (!fs.existsSync(OVERRIDE_FILE)) return {}
    return JSON.parse(fs.readFileSync(OVERRIDE_FILE, 'utf-8'))
  } catch { return {} }
}

function writeOverrides(data: OverrideMap) {
  fs.writeFileSync(OVERRIDE_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

// MERGED_PRODUCTS đã gồm sản phẩm gốc + sản phẩm mới thêm + áp dụng override
// Ở đây chỉ cần áp dụng thêm stock realtime
export function getAllProducts(): Product[] {
  const stock = readStock()

  return MERGED_PRODUCTS.map(p => ({
    ...p,
    colorVariants: p.colorVariants.map(v => {
      const s = stock[v.id]
      return s ? { ...v, inStock: s.inStock } : v
    }),
  }))
}

export function getProductById(id: string): Product | undefined {
  return getAllProducts().find(p => p.id === id)
}

export function updateProduct(id: string, data: Override) {
  const overrides = readOverrides()
  overrides[id] = { ...(overrides[id] ?? {}), ...data }
  writeOverrides(overrides)
  return getProductById(id)
}
