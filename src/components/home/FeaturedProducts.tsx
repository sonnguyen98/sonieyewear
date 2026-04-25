import Link from 'next/link'
import ProductCard from '@/components/catalog/ProductCard'
import { VI } from '@/constants/vietnamese'
import { getBestSellers } from '@/data/products'

export default function FeaturedProducts() {
  const products = getBestSellers(6)

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-display-md font-black text-brand-black">{VI.home.featuredHeading}</h2>
          <p className="text-brand-muted text-sm mt-1">{VI.home.featuredSub}</p>
        </div>
        <Link href="/gong-kinh" className="text-sm font-semibold text-brand-black underline underline-offset-2 hidden sm:block">
          {VI.home.viewAll}
        </Link>
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="flex sm:grid sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none">
        {products.map(product => (
          <div key={product.id} className="flex-shrink-0 w-[70vw] xs:w-[60vw] sm:w-auto snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="sm:hidden mt-4 text-center">
        <Link href="/gong-kinh" className="text-sm font-semibold text-brand-black underline underline-offset-2">
          {VI.home.viewAll}
        </Link>
      </div>
    </section>
  )
}
