import type { Metadata } from 'next'
import QuangMinhLandingPage from '@/components/landing/kinh-mat-quang-minh/QuangMinhLandingPage'

const CANONICAL_URL = 'https://kinhmatsoni.com/lp/kinh-mat-quang-minh'

export const metadata: Metadata = {
  title: {
    absolute: 'Kính Mắt Viện Hàn — Đo Mắt Chính Xác, Cắt Kính Lấy Ngay tại Quang Minh, Hà Nội',
  },
  description:
    'Kính Mắt Viện Hàn — Đo mắt độ chính xác cao bằng máy công nghệ hiện đại, cắt kính lấy ngay, sửa kính, thay gọng thay tròng. Chuyên khoa tật khúc xạ Cận - Viễn - Loạn thị, ngay tại Tổ 11 Gia Tân, Quang Minh, Hà Nội — gần khu công nghiệp Quang Minh.',
  keywords: [
    'kính mắt Viện Hàn',
    'cửa hàng kính mắt Quang Minh',
    'kính mắt gần khu công nghiệp Quang Minh',
    'đo mắt lấy ngay',
    'cắt kính lấy ngay',
    'cắt kính cận giá rẻ',
    'đo thị lực chính xác',
    'kính cận học sinh',
    'kính chống ánh sáng xanh',
    'kính lão đọc sách',
    'kính chơi game chống mỏi mắt',
    'cắt kính theo đơn bác sĩ',
    'kính râm có độ',
    'thay tròng kính lấy liền',
    'kính chống lóa đi đêm',
    'kính mát đổi màu',
    'kính đa tròng chống mỏi mắt',
    'kính cận mỏng đẹp',
    'sửa kính gọng bị lệch',
    'kính cho người đi làm văn phòng',
  ],
  alternates: { canonical: CANONICAL_URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Kính Mắt Viện Hàn — Đo Mắt Chính Xác, Cắt Kính Lấy Ngay tại Quang Minh',
    description:
      'Đo mắt công nghệ hiện đại, cắt kính lấy ngay, sửa kính - thay gọng - thay tròng. Chuyên khoa Cận - Viễn - Loạn thị. Tổ 11 Gia Tân, Quang Minh, Hà Nội.',
    url: CANONICAL_URL,
    locale: 'vi_VN',
    type: 'website',
    images: [{ url: '/images/landing-pages/kinh-mat-quang-minh/mat-tien.jpg' }],
  },
}

const STORE = {
  name: 'Kính Mắt Viện Hàn',
  address: 'Tổ 11 Gia Tân, Quang Minh, Hà Nội',
  phone: '0363978798',
  phoneIntl: '+84363978798',
  mapShareUrl: 'https://share.google/8IPtJECr98fWCVsjb',
}

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Optician',
    name: STORE.name,
    address: {
      '@type': 'PostalAddress',
      streetAddress: STORE.address,
      addressCountry: 'VN',
    },
    telephone: STORE.phoneIntl,
    url: CANONICAL_URL,
    hasMap: STORE.mapShareUrl,
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '07:00',
      closes: '21:00',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <QuangMinhLandingPage store={STORE} />
    </>
  )
}
