import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MobileNav from '@/components/layout/MobileNav'
import ZaloFloatingButton from '@/components/ui/ZaloFloatingButton'

const beVietnam = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-be-vietnam',
  display: 'swap',
})

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: 'SONi Kính — Kính Mắt Thời Trang & Thử Kính Ảo',
    template: '%s | SONi Kính',
  },
  description:
    'Mua kính mắt thời trang online. Thử kính ảo 3D với công nghệ AR MediaPipe. Đặt hàng qua Zalo, giảm ngay 20%. Giao hàng toàn quốc.',
  keywords: ['kính mắt', 'gọng kính', 'kính cận', 'thử kính ảo', 'AR', 'Việt Nam'],
  openGraph: {
    title: 'SONi Kính — Kính Đẹp Đúng Mốt',
    description: 'Thử kính ảo 3D ngay tại nhà. Đặt hàng qua Zalo — giảm 20%.',
    locale: 'vi_VN',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={beVietnam.variable}>
      <body className="font-sans antialiased bg-brand-white text-brand-black">
        <Header />
        <main className="pb-16 md:pb-0">
          {children}
        </main>
        <Footer />
        <MobileNav />
        <ZaloFloatingButton />
      </body>
    </html>
  )
}
