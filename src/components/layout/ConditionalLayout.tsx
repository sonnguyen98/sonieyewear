'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import Header from './Header'
import Footer from './Footer'
import MobileNav from './MobileNav'
import ZaloFloatingButton from '@/components/ui/ZaloFloatingButton'
import AffiliateTracker from '@/components/ui/AffiliateTracker'

// LP routes (/lp/*) và landing thu lead (/luu-do-kinh/*) tự lo nav + footer + CTA — không render chrome của site chính.
export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? ''
  const isBareRoute = pathname.startsWith('/lp/') || pathname.startsWith('/luu-do-kinh')

  if (isBareRoute) {
    return (
      <>
        {children}
        <Suspense fallback={null}><AffiliateTracker /></Suspense>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileNav />
      <ZaloFloatingButton />
      <Suspense fallback={null}><AffiliateTracker /></Suspense>
    </>
  )
}
