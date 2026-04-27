import Link from 'next/link'
import Image from 'next/image'
import Button from '@/components/ui/Button'

export default function PromoSection() {
  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-blue-100 min-h-[280px] md:min-h-[320px]">

          {/* Ảnh nền */}
          <Image
            src="/images/hero/hero-ai.png"
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />

          {/* Nội dung */}
          <div className="relative p-8 md:p-12 max-w-lg">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-100/90 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              ✨ Tư vấn AI miễn phí
            </div>

            <h2 className="text-display-lg font-black mb-3 leading-tight text-gray-900">
              Tìm Gọng Kính
              <span className="block text-brand-zalo">Phù Hợp Nhất</span>
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Chụp ảnh khuôn mặt — AI phân tích hình dạng và đề xuất 3–5 mẫu gọng phù hợp nhất. Nhanh chóng, chính xác, hoàn toàn miễn phí.
            </p>

            <Link href="/thu-kinh">
              <Button variant="zalo" size="lg">
                <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                Tư Vấn Ngay Miễn Phí
              </Button>
            </Link>

            <div className="flex flex-wrap gap-2 mt-6">
              {['Phân tích khuôn mặt AI', 'Đề xuất 3–5 mẫu gọng', 'Không cần tải app', 'Miễn phí'].map(f => (
                <span key={f} className="text-xs bg-white/90 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200 shadow-sm">
                  ✓ {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
