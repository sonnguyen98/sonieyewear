import PromoStrip from '@/components/home/PromoStrip'
import HeroBanner from '@/components/home/HeroBanner'
import CategoryGrid from '@/components/home/CategoryGrid'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import PromoSection from '@/components/home/PromoSection'
import AffiliateBanner from '@/components/home/AffiliateBanner'

export default function HomePage() {
  return (
    <>
      <PromoStrip />
      <HeroBanner />
      <CategoryGrid />
      <FeaturedProducts />
      <AffiliateBanner />
      <PromoSection />
    </>
  )
}
