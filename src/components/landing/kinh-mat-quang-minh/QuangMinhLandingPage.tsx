'use client'

import { useState } from 'react'

interface StoreInfo {
  name: string
  address: string
  phone: string
  phoneIntl: string
  mapShareUrl: string
}

interface Props {
  store: StoreInfo
}

const SERVICES = [
  {
    title: 'Đo Mắt Độ Chính Xác Cao',
    desc: 'Máy đo công nghệ hiện đại, xác định đúng độ cận - viễn - loạn trước khi cắt kính.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    ),
  },
  {
    title: 'Cắt Kính Lấy Ngay',
    desc: 'Không phải chờ đợi nhiều ngày — cắt kính và lấy ngay tại cửa hàng.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
  {
    title: 'Sửa Kính',
    desc: 'Nhận sửa gọng kính bị lệch, lỏng ốc vít, gãy càng — xử lý nhanh gọn.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    ),
  },
  {
    title: 'Thay Gọng - Thay Mắt Kính',
    desc: 'Giữ gọng cũ, thay tròng kính mới — hoặc đổi gọng mới theo ý thích.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
    ),
  },
  {
    title: 'Chuyên Khoa Tật Khúc Xạ',
    desc: 'Cận - Viễn - Loạn thị, tư vấn đúng loại tròng phù hợp cho từng mắt.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    ),
  },
]

const GLASSES_TYPES = [
  'Kính cận mỏng đẹp',
  'Kính chống ánh sáng xanh',
  'Kính lão đọc sách',
  'Kính râm có độ',
  'Kính mát đổi màu',
  'Kính đa tròng chống mỏi mắt',
  'Kính chơi game chống mỏi mắt',
  'Kính chống lóa đi đêm',
  'Cắt kính theo đơn bác sĩ',
  'Thay tròng kính mới giữ gọng cũ',
]

const FAQS = [
  {
    q: 'Cửa hàng có đo mắt trước khi cắt kính không?',
    a: 'Có. Kính Mắt Viện Hàn đo mắt bằng máy công nghệ hiện đại, xác định chính xác độ cận - viễn - loạn thị trước khi tư vấn tròng kính phù hợp.',
  },
  {
    q: 'Cắt kính có phải chờ nhiều ngày không?',
    a: 'Không. Cửa hàng cắt kính lấy ngay tại chỗ, không phải chờ đợi nhiều ngày như đặt online.',
  },
  {
    q: 'Kính bị lệch, gãy càng có sửa được không?',
    a: 'Có. Cửa hàng nhận sửa kính, thay gọng, thay tròng kính — kể cả giữ lại gọng cũ và chỉ thay tròng mới.',
  },
  {
    q: 'Cửa hàng ở đâu, có gần khu công nghiệp Quang Minh không?',
    a: 'Địa chỉ tại Tổ 11 Gia Tân, Quang Minh, Hà Nội — ngay khu vực khu công nghiệp Quang Minh, thuận tiện cho người lao động và dân văn phòng quanh khu vực.',
  },
  {
    q: 'Muốn tư vấn trước khi ra cửa hàng thì liên hệ thế nào?',
    a: 'Gọi trực tiếp hotline để được tư vấn loại kính, độ cận và giá phù hợp trước khi ghé cửa hàng.',
  },
]

function PhotoSlot({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 ${className ?? ''}`}>
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
      )}
    </div>
  )
}

export default function QuangMinhLandingPage({ store }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const telHref = `tel:${store.phoneIntl}`
  const phoneDisplay = store.phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')
  const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(`${store.name}, ${store.address}`)}&output=embed`

  return (
    <div className="min-h-screen bg-white text-brand-black font-sans pb-24 lg:pb-0">
      {/* Hero */}
      <section className="relative bg-brand-black">
        <PhotoSlot
          src="/images/landing-pages/kinh-mat-quang-minh/mat-tien.jpg"
          alt="Mặt tiền Kính Mắt Viện Hàn"
          className="aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9] w-full object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end px-4 pb-8 sm:px-8 sm:pb-14">
          <div className="max-w-2xl mx-auto w-full">
            <div className="rounded-2xl bg-black/25 backdrop-blur-md border border-white/10 px-5 py-6 sm:px-8 sm:py-8">
              <div className="animate-fade-in inline-flex items-start gap-2.5 rounded-2xl border border-brand-gold/50 bg-brand-gold/10 px-4 py-3 mb-4">
                <span className="relative flex h-2.5 w-2.5 shrink-0 mt-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-gold" />
                </span>
                <span className="bg-gradient-to-r from-brand-gold via-white to-brand-gold bg-[length:200%_100%] bg-clip-text text-transparent animate-shimmer text-lg sm:text-2xl font-extrabold tracking-wide uppercase leading-snug">
                  Cửa hàng kính mắt
                  <br />
                  khu công nghiệp Quang Minh · Hà Nội
                </span>
              </div>
              <h1 className="animate-slide-up text-2xl sm:text-display-lg font-extrabold text-white leading-tight">
                {store.name}
              </h1>
              <p className="animate-slide-up mt-3 text-white/90 text-sm sm:text-lg">
                Đo mắt độ chính xác cao · Cắt kính lấy ngay · Sửa kính, thay gọng - thay tròng
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a
                  href={store.mapShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="animate-pulse-gold flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-brand-gold to-[#B8863F] text-brand-black font-bold px-7 py-4 text-base sm:text-lg shadow-lg shadow-black/30 hover:brightness-110 active:scale-95 transition"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  Chỉ Đường Tới Cửa Hàng
                </a>
                <a
                  href={telHref}
                  className="flex items-center justify-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/60 text-white font-semibold px-5 py-3 text-sm hover:bg-white/20 active:scale-95 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a1.5 1.5 0 001.5-1.5v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5a1.5 1.5 0 00-1.5 1.5v2.25z" />
                  </svg>
                  Gọi {phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-white/5 bg-brand-black">
        <div className="max-w-4xl mx-auto px-5 py-6 grid grid-cols-3 gap-3 sm:gap-6">
          {[
            'Máy đo công nghệ hiện đại',
            'Cắt kính lấy ngay',
            'Chuyên khoa khúc xạ',
          ].map((t) => (
            <div key={t} className="flex flex-col items-center text-center gap-2">
              <span className="w-9 h-9 rounded-full border border-brand-gold/50 bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              <span className="text-xs sm:text-sm font-semibold text-white leading-snug">{t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Dịch vụ chính */}
      <section className="max-w-4xl mx-auto px-5 py-14">
        <span className="block mx-auto mb-3 h-0.5 w-10 bg-brand-gold rounded-full" />
        <h2 className="text-2xl sm:text-display-md font-extrabold text-center mb-2">Dịch Vụ Chính</h2>
        <p className="text-brand-muted text-center mb-10 max-w-lg mx-auto">
          Đầy đủ dịch vụ về mắt kính tại một điểm đến — không cần chạy nhiều nơi.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {SERVICES.map((s) => (
            <div key={s.title} className="flex gap-4 rounded-2xl border border-brand-border p-5 bg-white hover:border-brand-gold/50 hover:shadow-md transition">
              <div className="shrink-0 w-11 h-11 rounded-full bg-brand-black text-brand-gold flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  {s.icon}
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-brand-black mb-1">{s.title}</h3>
                <p className="text-sm text-brand-muted">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ảnh thực tế */}
      <section className="bg-brand-light py-14">
        <div className="max-w-4xl mx-auto px-5">
          <span className="block mx-auto mb-3 h-0.5 w-10 bg-brand-gold rounded-full" />
          <h2 className="text-2xl sm:text-display-md font-extrabold text-center mb-8">Hình Ảnh Thực Tế</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <PhotoSlot
              src="/images/landing-pages/kinh-mat-quang-minh/mat-tien.jpg"
              alt="Mặt tiền Kính Mắt Viện Hàn"
              className="aspect-square rounded-xl col-span-1"
            />
            <PhotoSlot
              src="/images/landing-pages/kinh-mat-quang-minh/do-mat.jpg"
              alt="Đo mắt tại Kính Mắt Viện Hàn"
              className="aspect-square rounded-xl col-span-1"
            />
            <PhotoSlot
              src="/images/landing-pages/kinh-mat-quang-minh/trung-bay.jpg"
              alt="Kệ trưng bày gọng kính"
              className="aspect-square rounded-xl col-span-1"
            />
            <PhotoSlot
              src="/images/landing-pages/kinh-mat-quang-minh/cat-kinh.jpg"
              alt="Cắt kính tại cửa hàng"
              className="aspect-square rounded-xl col-span-1"
            />
          </div>
        </div>
      </section>

      {/* Địa chỉ & bản đồ */}
      <section className="bg-brand-black text-white py-14">
        <div className="max-w-4xl mx-auto px-5">
          <span className="block mx-auto mb-3 h-0.5 w-10 bg-brand-gold rounded-full" />
          <h2 className="text-2xl sm:text-display-md font-extrabold text-center mb-2">Địa Chỉ Cửa Hàng</h2>
          <p className="text-white/70 text-center mb-3">{store.address}</p>
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/40 bg-brand-gold/10 px-4 py-1.5 text-sm font-semibold text-brand-gold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Mở cửa: 7:00 - 21:00 hằng ngày
            </span>
          </div>
          <div className="rounded-2xl overflow-hidden border border-white/10 h-64 sm:h-80 mb-6">
            <iframe
              src={mapEmbedSrc}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bản đồ Kính Mắt Viện Hàn"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={store.mapShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="animate-pulse-gold flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-brand-gold to-[#B8863F] text-brand-black font-bold px-7 py-4 text-base sm:text-lg shadow-lg shadow-black/30 hover:brightness-110 active:scale-95 transition"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              Chỉ Đường Tới Cửa Hàng
            </a>
            <a
              href={telHref}
              className="flex items-center justify-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/60 text-white font-semibold px-5 py-3 text-sm hover:bg-white/20 active:scale-95 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a1.5 1.5 0 001.5-1.5v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5a1.5 1.5 0 00-1.5 1.5v2.25z" />
              </svg>
              Gọi {phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      {/* Đa dạng loại kính */}
      <section className="max-w-4xl mx-auto px-5 py-14">
        <span className="block mx-auto mb-3 h-0.5 w-10 bg-brand-gold rounded-full" />
        <h2 className="text-2xl sm:text-display-md font-extrabold text-center mb-2">Đa Dạng Loại Kính</h2>
        <p className="text-brand-muted text-center mb-8 max-w-lg mx-auto">
          Phù hợp cho học sinh, dân văn phòng, người lái xe, người lớn tuổi.
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {GLASSES_TYPES.map((g) => (
            <span
              key={g}
              className="rounded-full bg-white border border-brand-border px-4 py-2 text-sm font-medium text-brand-black"
            >
              {g}
            </span>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-5 py-14">
        <span className="block mx-auto mb-3 h-0.5 w-10 bg-brand-gold rounded-full" />
        <h2 className="text-2xl sm:text-display-md font-extrabold text-center mb-8">Câu Hỏi Thường Gặp</h2>
        <div className="space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = openFaq === i
            return (
              <div key={item.q} className="rounded-xl border border-brand-border overflow-hidden">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left font-semibold text-brand-black bg-white"
                >
                  {item.q}
                  <svg
                    className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {isOpen && <div className="px-5 pb-4 text-sm text-brand-muted">{item.a}</div>}
              </div>
            )
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-light py-14">
        <div className="max-w-lg mx-auto px-5 text-center">
          <span className="block mx-auto mb-3 h-0.5 w-10 bg-brand-gold rounded-full" />
          <h2 className="text-2xl sm:text-display-md font-extrabold mb-3">Ghé Kính Mắt Viện Hàn Ngay Hôm Nay</h2>
          <p className="text-brand-muted mb-6">
            {store.address}. Bấm chỉ đường để được dẫn lối nhanh nhất, hoặc gọi trước nếu cần tư vấn.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={store.mapShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="animate-pulse-gold flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-brand-gold to-[#B8863F] text-brand-black font-bold px-7 py-4 text-base sm:text-lg shadow-lg shadow-black/10 hover:brightness-110 active:scale-95 transition"
            >
              Chỉ Đường Tới Cửa Hàng
            </a>
            <a
              href={telHref}
              className="flex items-center justify-center gap-2 rounded-full bg-white border border-brand-black/20 text-brand-black font-semibold px-5 py-3 text-sm hover:border-brand-black active:scale-95 transition"
            >
              Gọi {phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      {/* Minimal footer — không link về site chính */}
      <footer className="py-8 text-center text-sm text-brand-muted border-t border-brand-border">
        <p className="font-semibold text-brand-black">{store.name}</p>
        <p>{store.address}</p>
        <p>{phoneDisplay}</p>
      </footer>

      {/* Sticky CTA bar (mobile) — Chỉ đường là hành động chính */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white border-t border-brand-border shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="flex">
          <a
            href={telHref}
            className="flex items-center justify-center px-5 py-3.5 font-semibold text-brand-black border-r border-brand-border"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a1.5 1.5 0 001.5-1.5v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5a1.5 1.5 0 00-1.5 1.5v2.25z" />
            </svg>
          </a>
          <a
            href={store.mapShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 font-bold text-brand-black bg-gradient-to-b from-brand-gold to-[#B8863F]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            Chỉ Đường Tới Cửa Hàng
          </a>
        </div>
      </div>
    </div>
  )
}
