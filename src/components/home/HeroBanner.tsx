'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const SLIDES = [
  {
    id: 1,
    image: '/images/hero/hero-1.png',
    bg: 'bg-amber-50',
    accent: 'text-amber-600',
    pill: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-400',
    btnPrimary: 'bg-amber-500 hover:bg-amber-600 text-white',
    btnSecond: 'border-2 border-amber-400 text-amber-700 hover:bg-amber-50',
    tag: '🎉 Ưu đãi hôm nay',
    heading: ['Kính Đẹp', 'Đúng Mốt', 'Nét Như SONi'],
    headingColors: ['text-gray-900', 'text-amber-600', 'text-gray-700'],
    sub: 'Thử kính ảo ngay trên khuôn mặt bạn — không cần ra cửa hàng.',
    cta: 'Thử Kính Ngay',
    ctaHref: '/thu-kinh',
    cta2: 'Xem Bộ Sưu Tập',
    cta2Href: '/gong-kinh',
    stat1: { value: '500+', label: 'Mẫu gọng' },
    stat2: { value: '10K+', label: 'Khách hài lòng' },
    stat3: { value: '-20%', label: 'Giảm mọi đơn' },
  },
  {
    id: 2,
    image: '/images/hero/hero-2.png',
    bg: 'bg-sky-50',
    accent: 'text-sky-600',
    pill: 'bg-sky-100 text-sky-800 border-sky-200',
    dot: 'bg-sky-400',
    btnPrimary: 'bg-sky-500 hover:bg-sky-600 text-white',
    btnSecond: 'border-2 border-sky-400 text-sky-700 hover:bg-sky-50',
    tag: '✨ Tư vấn thông minh bằng AI',
    heading: ['Phân Tích', 'Khuôn Mặt', 'Đề Xuất Gọng'],
    headingColors: ['text-gray-900', 'text-sky-600', 'text-gray-500'],
    sub: 'Chụp ảnh — AI phân tích hình dáng khuôn mặt và đề xuất 3–5 mẫu gọng phù hợp nhất chỉ trong vài giây.',
    cta: 'Tư Vấn Ngay Miễn Phí',
    ctaHref: '/thu-kinh',
    cta2: 'Xem Bộ Sưu Tập',
    cta2Href: '/gong-kinh',
    stat1: { value: 'AI', label: 'Phân tích mặt' },
    stat2: { value: '5s', label: 'Kết quả nhanh' },
    stat3: { value: '100%', label: 'Miễn phí' },
  },
  {
    id: 3,
    image: '/images/hero/hero-3.png',
    bg: 'bg-rose-50',
    accent: 'text-rose-600',
    pill: 'bg-rose-100 text-rose-800 border-rose-200',
    dot: 'bg-rose-400',
    btnPrimary: 'bg-rose-500 hover:bg-rose-600 text-white',
    btnSecond: 'border-2 border-rose-400 text-rose-600 hover:bg-rose-50',
    tag: '🔥 Ưu đãi đặc biệt',
    heading: ['Giảm Thêm', '20% Mọi', 'Đơn Hàng'],
    headingColors: ['text-gray-900', 'text-rose-600', 'text-gray-600'],
    sub: 'Áp dụng cho tất cả sản phẩm — gọng kính và tròng kính. Đặt hàng ngay hôm nay.',
    cta: 'Mua Ngay Giảm 20%',
    ctaHref: '/gong-kinh',
    cta2: 'Xem Tròng Kính',
    cta2Href: '/trong-kinh',
    stat1: { value: '20%', label: 'Giảm ngay' },
    stat2: { value: '7', label: 'Ngày đổi trả' },
    stat3: { value: '12', label: 'Tháng BH' },
  },
  {
    id: 4,
    image: '/images/hero/hero-4.png',
    bg: 'bg-teal-50',
    accent: 'text-teal-700',
    pill: 'bg-teal-100 text-teal-800 border-teal-200',
    dot: 'bg-teal-500',
    btnPrimary: 'bg-teal-600 hover:bg-teal-700 text-white',
    btnSecond: 'border-2 border-teal-400 text-teal-700 hover:bg-teal-50',
    tag: '✅ Cam kết chất lượng',
    heading: ['Minh Bạch', 'Rõ Ràng —', 'Đúng Chất Lượng'],
    headingColors: ['text-gray-900', 'text-teal-600', 'text-gray-700'],
    sub: 'Kính của bạn sẽ được làm và quay video gửi qua Zalo — đảm bảo đúng gọng, đúng loại tròng, đúng số độ trước khi giao hàng.',
    cta: 'Tìm Hiểu Thêm',
    ctaHref: '/chinh-sach',
    cta2: 'Nhắn Zalo Ngay',
    cta2Href: '#',
    stat1: { value: '100%', label: 'Minh bạch' },
    stat2: { value: '📹', label: 'Video xác nhận' },
    stat3: { value: '0', label: 'Rủi ro cho KH' },
  },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 4500)
    return () => clearInterval(t)
  }, [paused])

  const slide = SLIDES[current]

  return (
    <section
      className={`relative overflow-hidden transition-colors duration-500 ${slide.bg}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 min-h-[360px] md:min-h-[440px]">

        {/* Cột trái — text, nền màu nhạt */}
        <div className="flex flex-col justify-center px-6 md:px-10 py-12 md:py-16 z-10">

          <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-5 border w-fit ${slide.pill}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${slide.dot}`}/>
            {slide.tag}
          </div>

          <h1 className="font-black tracking-tight mb-4">
            {slide.heading.map((line, i) => (
              <span key={i} className={`block leading-tight ${i === 0 ? 'text-3xl sm:text-4xl md:text-5xl' : i === 1 ? 'text-3xl sm:text-4xl md:text-5xl mt-1' : 'text-2xl sm:text-3xl md:text-4xl mt-1'} ${slide.headingColors[i]}`}>
                {line}
              </span>
            ))}
          </h1>

          <p className="text-gray-600 text-sm md:text-base mb-6 leading-relaxed max-w-sm">
            {slide.sub}
          </p>

          <div className="flex flex-wrap gap-3 mb-7">
            <Link href={slide.ctaHref}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 ${slide.btnPrimary}`}>
              {slide.cta}
            </Link>
            <Link href={slide.cta2Href}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 bg-white ${slide.btnSecond}`}>
              {slide.cta2}
            </Link>
          </div>

          <div className="flex gap-7 pt-4 border-t border-gray-200">
            {[slide.stat1, slide.stat2, slide.stat3].map(s => (
              <div key={s.label}>
                <div className={`text-xl font-black ${slide.accent}`}>{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cột phải — ảnh hiện 100% rõ nét, không overlay */}
        <div className="relative hidden md:block">
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
            >
              <Image
                src={s.image}
                alt=""
                fill
                className="object-cover object-center"
                priority={i === 0}
                sizes="50vw"
              />
            </div>
          ))}
        </div>

        {/* Mobile: ảnh hiện bên dưới text */}
        <div className="relative md:hidden h-52">
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
            >
              <Image
                src={s.image}
                alt=""
                fill
                className="object-cover object-center"
                sizes="100vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${i === current ? `w-6 h-2 ${slide.dot}` : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`}
          />
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-all z-20"
      >
        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <button
        onClick={() => setCurrent(c => (c + 1) % SLIDES.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-all z-20"
      >
        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </section>
  )
}
