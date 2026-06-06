import PromoStrip from '@/components/home/PromoStrip'
import HeroBanner from '@/components/home/HeroBanner'
import CategoryGrid from '@/components/home/CategoryGrid'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import FaqBlock from '@/components/home/FaqBlock'
import AffiliateBanner from '@/components/home/AffiliateBanner'
import PromoSection from '@/components/home/PromoSection'

export default function HomePage() {
  return (
    <>
      <PromoStrip />
      <HeroBanner />
      <CategoryGrid />
      <FeaturedProducts />
      <FaqBlock />
      <AffiliateBanner />
      <PromoSection />
    </>
  )
}
