'use client'

import Link from 'next/link'
import Image from 'next/image'
import { openZaloDefault } from '@/lib/zalo'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <Image src="/images/logo.png" alt="SONi Eyewear" width={140} height={56} className="h-12 w-auto object-contain"/>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              <span className="font-bold text-gray-700">SONi — Cắt Kính Online.</span> Đo độ tại nhà, thử kính bằng AR, giao kính đã cắt tận tay. Không cần ra tiệm.
            </p>
          </div>

          {/* Sản phẩm */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-700">Sản Phẩm</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/gong-kinh" className="hover:text-gray-900 transition-colors">Gọng Kính</Link></li>
              <li><Link href="/trong-kinh" className="hover:text-gray-900 transition-colors">Tròng Kính</Link></li>
              <li><Link href="/gong-kinh?shape=round" className="hover:text-gray-900 transition-colors">Gọng Tròn</Link></li>
              <li><Link href="/gong-kinh?type=rimless" className="hover:text-gray-900 transition-colors">Gọng Không Viền</Link></li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-700">Hỗ Trợ</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><button onClick={openZaloDefault} className="hover:text-gray-900 transition-colors text-left">Tư Vấn Zalo</button></li>
              <li><Link href="/thu-kinh" className="hover:text-gray-900 transition-colors">Thử Kính 3D</Link></li>
              <li><Link href="/chinh-sach" className="hover:text-gray-900 transition-colors">Chính Sách Bảo Hành</Link></li>
              <li><span className="text-gray-400">Đổi trả trong 7 ngày</span></li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-700">Liên Hệ</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <button onClick={openZaloDefault} className="flex items-center gap-2 hover:text-gray-900 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#0068FF">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm-3 7h6a1 1 0 110 2H9a1 1 0 110-2zm0 4h4a1 1 0 110 2H9a1 1 0 110-2z"/>
                  </svg>
                  Nhắn Zalo ngay
                </button>
              </li>
              <li><Link href="/he-thong" className="hover:text-gray-900 transition-colors">Hệ Thống Cửa Hàng</Link></li>
              <li><Link href="/soni-share" className="hover:text-gray-900 transition-colors">SONi Share</Link></li>
              <li><Link href="/affiliate" className="hover:text-amber-600 text-amber-500 font-semibold transition-colors">💰 Kiếm Tiền Affiliate</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© 2025 SONi Kính. Bảo lưu mọi quyền.</p>
          <div className="flex gap-4">
            <Link href="/chinh-sach" className="hover:text-gray-700">Chính sách bảo hành</Link>
            <span>Điều khoản sử dụng</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
