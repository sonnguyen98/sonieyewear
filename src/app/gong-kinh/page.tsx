import { Suspense } from 'react'
import CatalogContent from './CatalogContent'
import { getProducts } from '@/lib/getProducts'

// Luôn render mới từ server, không cache ở CDN/Vercel Edge
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CatalogPage() {
  const initialProducts = await getProducts()
  return (
    <Suspense>
      <CatalogContent initialProducts={initialProducts} />
    </Suspense>
  )
}
