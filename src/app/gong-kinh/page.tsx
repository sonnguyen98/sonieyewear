import { Suspense } from 'react'
import CatalogContent from './CatalogContent'
import { getProducts } from '@/lib/getProducts'

export default async function CatalogPage() {
  const initialProducts = await getProducts()
  return (
    <Suspense>
      <CatalogContent initialProducts={initialProducts} />
    </Suspense>
  )
}
