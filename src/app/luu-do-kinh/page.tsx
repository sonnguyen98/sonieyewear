import Link from 'next/link'

const SO_Y_BA_URL = '/so-y-ba'

export default function LuuDoKinhLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white">
      {/* Mini header — chỉ logo, không nav */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1 select-none">
            <span className="text-xl font-black tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
              <span style={{ color: '#5A5A5A' }}>S</span>
              <span style={{ color: '#C9A84C' }}>O</span>
              <span style={{ color: '#5A5A5A' }}>N</span>
              <span style={{ color: '#1E4D78' }}>i</span>
            </span>
            <span className="text-[9px] font-semibold tracking-[0.1em] uppercase text-gray-500">
              Cắt Kính Online
            </span>
          </Link>
          <span className="text-[10px] text-gray-400">Miễn phí mãi mãi</span>
        </div>
      </div>

      {/* HERO */}
      <section className="px-4 pt-8 pb-10">
        <div className="max-w-md mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-[11px] font-bold px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"/>
            🎁 Dịch vụ miễn phí cho người Việt
          </div>

          {/* Pain headline */}
          <h1 className="text-[28px] sm:text-3xl font-black text-gray-900 leading-tight mb-3">
            Mất giấy toa kính?<br/>
            Quên độ mỗi lần cắt?
          </h1>

          {/* Solution subline */}
          <p className="text-base text-gray-600 leading-relaxed mb-6">
            <span className="font-bold text-gray-900">Sổ Y Bạ SONi</span> nhớ giúp bạn — lần sau cắt kính chỉ cần số điện thoại là ra ngay toa độ cũ.
            <span className="block mt-1 text-amber-700 font-semibold">100% miễn phí, không tốn 1 đồng.</span>
          </p>

          {/* Demo visual — tiếng Việt thuần, không đánh đố khách */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Sổ Y Bạ của bạn — ví dụ</div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm text-gray-500">Mắt phải</span>
                  <span className="text-sm font-bold text-gray-900">Cận 2.25 độ + loạn 0.50</span>
                </div>
                <div className="text-[10px] text-gray-300 text-right font-mono">SPH -2.25 · CYL -0.50</div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm text-gray-500">Mắt trái</span>
                  <span className="text-sm font-bold text-gray-900">Cận 2.00 độ + loạn 0.25</span>
                </div>
                <div className="text-[10px] text-gray-300 text-right font-mono">SPH -2.00 · CYL -0.25</div>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm text-gray-500">Khoảng cách 2 mắt</span>
                  <span className="text-sm font-bold text-gray-900">62 mm</span>
                </div>
                <div className="text-[10px] text-gray-300 text-right font-mono">PD: 62 mm</div>
              </div>
              <div className="text-[11px] text-gray-400 pt-1">Cập nhật lần cuối: 14/06/2026</div>
            </div>
          </div>

          {/* Trấn an: khách không biết SPH/CYL không sao */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6 flex items-start gap-2.5">
            <span className="text-lg flex-shrink-0 leading-none mt-0.5">📸</span>
            <p className="text-xs text-blue-900 leading-relaxed">
              <span className="font-bold">Không biết các số này?</span> Đừng lo — chỉ cần chụp ảnh toa kính cũ, SONi tự đọc và lưu giúp bạn.
            </p>
          </div>

          {/* CTA chính — đi thẳng /so-y-ba */}
          <Link
            href={SO_Y_BA_URL}
            className="block w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-base text-center rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            🎁 TẠO SỔ Y BẠ — MIỄN PHÍ
          </Link>
          <p className="text-[11px] text-gray-500 text-center mt-2.5">
            Chỉ cần 30 giây · Không cần mật khẩu · Không tốn 1 đồng
          </p>

          {/* Quick trust row */}
          <div className="grid grid-cols-3 gap-2 mt-6">
            {[
              { icon: '🆓', text: 'Miễn phí mãi mãi' },
              { icon: '🔒', text: 'Riêng tư, bảo mật' },
              { icon: '⚡', text: 'Vào ngay, 30 giây' },
            ].map(b => (
              <div key={b.text} className="bg-white rounded-xl p-2.5 text-center border border-gray-100">
                <div className="text-lg mb-0.5">{b.icon}</div>
                <p className="text-[10px] text-gray-600 leading-tight font-medium">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 LÝ DO */}
      <section className="px-4 py-12 bg-gradient-to-b from-white to-amber-50/50">
        <div className="max-w-md mx-auto">
          <p className="text-[11px] font-bold tracking-widest text-amber-700 uppercase mb-2">Vì sao bạn cần Sổ Y Bạ</p>
          <h2 className="text-2xl font-black text-gray-900 mb-6 leading-tight">
            3 lý do khách SONi không bao giờ mất toa kính
          </h2>
          <div className="space-y-3">
            {[
              {
                num: '01',
                title: 'Không phải đi đo lại mỗi năm',
                desc: 'Lần sau cắt kính chỉ cần nhập SĐT — toa độ cũ hiện ra ngay. Tiết kiệm 50–100k phí đo và 30 phút chờ.',
              },
              {
                num: '02',
                title: 'Theo dõi độ mắt qua từng năm',
                desc: 'Biểu đồ độ mắt theo thời gian — biết mắt mình có tăng độ không. Bác sĩ kê toa mới có dữ liệu để so sánh.',
              },
              {
                num: '03',
                title: 'Tư vấn AI gọng phù hợp khuôn mặt',
                desc: 'Sau khi tạo Sổ Y Bạ, dùng được AI Try-On miễn phí — chụp ảnh khuôn mặt, AI gợi ý 5 gọng hợp nhất.',
              },
            ].map(r => (
              <div key={r.num} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 text-amber-700 font-black flex items-center justify-center text-sm">
                    {r.num}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base mb-1">{r.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 py-12">
        <div className="max-w-md mx-auto">
          <p className="text-[11px] font-bold tracking-widest text-amber-700 uppercase mb-2">3 bước đơn giản</p>
          <h2 className="text-2xl font-black text-gray-900 mb-6 leading-tight">
            Tạo xong là dùng được luôn
          </h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Nhập SĐT + Tên', desc: 'Không cần mật khẩu, không cần OTP — chỉ 30 giây.' },
              { step: '2', title: 'Chụp ảnh toa cũ — SONi đọc giúp', desc: 'Có toa kính cũ thì chụp 1 ảnh, SONi tự đọc và lưu (không cần hiểu SPH/CYL). Chưa có toa cũng không sao — lần đầu cắt kính SONi đo và lưu cho bạn.' },
              { step: '3', title: 'Lần sau cắt kính chỉ cần SĐT', desc: 'SONi auto-điền độ cũ vào đơn — bạn chỉ chọn gọng và xác nhận.' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black flex items-center justify-center text-xl shadow-md">
                  {s.step}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-bold text-gray-900 text-base mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mini CTA giữa trang */}
          <Link
            href={SO_Y_BA_URL}
            className="mt-8 block w-full py-3.5 bg-white border-2 border-amber-400 text-amber-700 hover:bg-amber-50 font-bold text-sm text-center rounded-xl transition-all active:scale-[0.98]"
          >
            → Vào Tạo Sổ Y Bạ Ngay
          </Link>
        </div>
      </section>

      {/* CTA cuối */}
      <section className="px-4 py-14 bg-gradient-to-br from-amber-500 to-orange-500">
        <div className="max-w-md mx-auto text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-black mb-3 leading-tight">
            Đừng quên độ kính nữa.
          </h2>
          <p className="text-amber-50 text-sm mb-6 leading-relaxed">
            Tạo Sổ Y Bạ trong 30 giây. Lần sau cắt kính bạn cảm ơn chính mình.
          </p>
          <Link
            href={SO_Y_BA_URL}
            className="block w-full py-4 bg-white text-orange-600 font-black text-base text-center rounded-xl shadow-lg active:scale-[0.98] transition-all"
          >
            🎁 TẠO SỔ Y BẠ MIỄN PHÍ
          </Link>
          <p className="text-[11px] text-amber-50/80 mt-4">
            SONi — Cắt Kính Online · Phục vụ người Việt
          </p>
        </div>
      </section>

      {/* Footer mini */}
      <footer className="px-4 py-6 text-center">
        <p className="text-[11px] text-gray-400">
          © 2026 SONi — Cắt Kính Online ·{' '}
          <Link href="/chinh-sach" className="underline hover:text-gray-600">Chính sách bảo mật</Link>
        </p>
      </footer>
    </div>
  )
}

