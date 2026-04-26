import Link from 'next/link'
import Image from 'next/image'
import { kvGet, KV_KEYS } from '@/lib/kv-store'
import lensDataFallback from '@/data/lens-products.json'

const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

interface LensItem { id: string; name: string; desc: string; price: number; badge: string; image: string; features: string[] }

export default async function TrongKinhPage() {
  const lensData: LensItem[] =
    (await kvGet<LensItem[]>(KV_KEYS.lensProducts, 'lens-products.json')) ?? lensDataFallback

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-brand-black mb-2">Tròng Kính</h1>
        <p className="text-brand-muted">Chọn loại tròng phù hợp — lắp cho bất kỳ gọng kính nào tại SONi</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {lensData.map(t => (
          <div key={t.id} className="bg-white rounded-2xl border border-brand-border overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
              {t.image
                ? <Image src={t.image} alt={t.name} fill className="object-cover" unoptimized sizes="400px"/>
                : <div className="w-full h-full flex items-center justify-center text-5xl">🔵</div>
              }
              {t.badge && (
                <span className="absolute top-3 left-3 text-xs bg-brand-gold text-white font-bold px-2.5 py-1 rounded-full shadow">
                  {t.badge}
                </span>
              )}
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-bold text-brand-black text-base leading-tight flex-1">{t.name}</h2>
              </div>
              <p className="text-sm text-brand-muted leading-relaxed mb-4 flex-1">{t.desc}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {t.features.map(f => (
                  <span key={f} className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">✓ {f}</span>
                ))}
              </div>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-brand-border">
                <span className="font-black text-brand-black text-lg">{fmt(t.price)}</span>
                <Link href="/gong-kinh" className="bg-brand-zalo text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-blue-700 transition-colors">
                  Chọn Gọng + Tròng
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 bg-sky-50 border border-sky-100 rounded-2xl p-6 text-center">
        <p className="text-lg font-bold mb-2 text-gray-900">Chưa có gọng kính?</p>
        <p className="text-gray-500 text-sm mb-4">Chọn gọng trước, thêm tròng khi đặt hàng — nhận giảm 20% toàn bộ đơn</p>
        <Link href="/gong-kinh" className="inline-block bg-brand-zalo text-white font-bold px-6 py-3 rounded-full hover:bg-blue-700 transition-colors">
          Xem Gọng Kính →
        </Link>
      </div>
    </div>
  )
}
