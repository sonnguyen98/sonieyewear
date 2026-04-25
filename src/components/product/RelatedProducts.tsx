import type { Product } from '@/types/product'
import { VI } from '@/constants/vietnamese'
import ProductCard from '@/components/catalog/ProductCard'

interface RelatedProductsProps {
  products: Product[]
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null

  return (
    <section className="mt-12">
      <h2 className="text-display-md font-black text-brand-black mb-6">{VI.product.relatedTitle}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
