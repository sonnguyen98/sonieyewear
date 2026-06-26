import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import CartProvider from '@/components/providers/CartProvider'

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
    default: 'SONi — Cắt Kính Online | Đo Mắt, Thử Kính, Giao Tận Nhà',
    template: '%s | SONi — Cắt Kính Online',
  },
  description:
    'SONi — Thương hiệu Cắt Kính Online. Thử kính bằng AR, tư vấn gọng phù hợp khuôn mặt bằng AI, giao kính đã cắt tận nhà toàn quốc. Không cần ra tiệm.',
  keywords: ['cắt kính online', 'kính mắt online', 'soni eyewear', 'soni cắt kính', 'gọng kính', 'kính cận online', 'thử kính ảo', 'Việt Nam'],
  openGraph: {
    title: 'SONi — Cắt Kính Online',
    description: 'Thương hiệu Cắt Kính Online — Thử kính AR, giao tận nhà. Không cần ra tiệm.',
    locale: 'vi_VN',
    type: 'website',
  },
    other: {
          'zalo-platform-site-verification': 'GOIyCPcI43fQhuWtt91Q7W2Xt0VirmbTE3au',
    },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={beVietnam.variable}>
      <body className="font-sans antialiased bg-brand-white text-brand-black" suppressHydrationWarning>
        <CartProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </CartProvider>
      </body>
    </html>
  )
}
