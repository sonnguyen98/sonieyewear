import { Suspense } from 'react'
import CatalogContent from './CatalogContent'
import { getProducts } from '@/lib/getProducts'

// ISR: cache HTML 60s, revalidate background. Admin gọi revalidatePath sau khi update.
export const revalidate = 60

export default async function CatalogPage() {
  const initialProducts = await getProducts()
  return (
    <Suspense>
      <CatalogContent initialProducts={initialProducts} />
    </Suspense>
  )
}
