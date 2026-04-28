import Link from 'next/link'

export default function AffiliateBanner() {
  return (
    <section className="px-4 py-6 md:py-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/affiliate"
          className="group relative block overflow-hidden rounded-3xl bg-gray-900 hover:shadow-2xl transition-all duration-300">

          {/* Decorative blobs */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center gap-5 px-6 py-7 sm:px-10 sm:py-8">

            {/* Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl sm:text-4xl">💰</span>
            </div>

            {/* Text */}
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 bg-amber-400/15 text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-400/25 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"/>
                Chương trình kiếm tiền
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-1.5">
                Giới thiệu khách — nhận <span className="text-amber-400">10% hoa hồng</span>
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Chia sẻ link cá nhân, mỗi đơn hàng thành công bạn nhận ngay 10% giá trị đơn. Rút tiền về ngân hàng khi đủ 100.000đ.
              </p>
            </div>

            {/* CTA */}
            <div className="flex-shrink-0 flex flex-row sm:flex-col items-center gap-2">
              <span className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-gray-900 font-black text-sm rounded-2xl transition-colors group-hover:scale-105 transition-transform shadow-lg shadow-amber-400/30 whitespace-nowrap">
                Đăng ký ngay →
              </span>
              <span className="text-[11px] text-gray-500 sm:text-center whitespace-nowrap">Miễn phí · Không giới hạn</span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}
