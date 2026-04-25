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
    default: 'Kính Mắt SONi — Kính Đẹp Đúng Mốt Nét Như SONi',
    template: '%s | Kính Mắt SONi',
  },
  description:
    'Kính Mắt SONi — Gọng kính thời trang chính hãng. Tư vấn gọng phù hợp khuôn mặt bằng AI. Giảm 20% khi đặt hàng. Giao hàng toàn quốc.',
  keywords: ['kính mắt', 'gọng kính', 'kính cận', 'kính mắt soni', 'kinhmatsoni', 'Việt Nam'],
  openGraph: {
    title: 'Kính Mắt SONi — Kính Đẹp Đúng Mốt',
    description: 'Tư vấn gọng kính phù hợp khuôn mặt bằng AI. Giảm 20% mọi đơn hàng.',
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
