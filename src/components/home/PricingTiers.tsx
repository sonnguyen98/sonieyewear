import Link from 'next/link'
import { kvGet, KV_KEYS } from '@/lib/kv-store'
import lensDataFallback from '@/data/lens-products.json'

const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

interface TierItem { id: string; tierValue?: number; name: string; price: number }

const FALLBACK_TIERS: TierItem[] = lensDataFallback as TierItem[]

export default async function PricingTiers() {
  const raw = (await kvGet<TierItem[]>(KV_KEYS.lensProducts, 'lens-products.json')) ?? FALLBACK_TIERS
  const valid = raw.filter(i => i.tierValue === 350000 || i.tierValue === 650000 || i.tierValue === 900000)
  const tiers = FALLBACK_TIERS.map(def => valid.find(v => v.tierValue === def.tierValue) ?? def)

  return (
    <section className="py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-display-lg font-black text-brand-black">Cắt Kính Tiền Trăm Dùng Vài Năm</h2>
          <p className="text-sm text-brand-muted mt-1">Chọn 1 trong 3 mức tròng — gọng được tặng kèm miễn phí</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tiers.map(t => {
            const isPopular = t.tierValue === 650000
            return (
              <div key={t.id}
                className={`bg-white rounded-2xl border-2 p-5 flex flex-col items-center text-center relative ${isPopular ? 'border-brand-black shadow-lg sm:-translate-y-1.5' : 'border-brand-border'}`}>
                {isPopular && (
                  <span className="absolute -top-3 bg-brand-black text-white text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    ⭐ Phổ biến nhất
                  </span>
                )}
                <p className="font-bold text-brand-black text-sm mt-2">{t.name}</p>
                <p className="text-2xl font-black text-brand-black my-2">{fmt(t.price)}</p>
                <p className="text-xs text-brand-muted mb-4">🎁 Tặng kèm gọng kính bạn chọn</p>
                <Link href={`/gong-kinh?tier=${t.tierValue}`}
                  className={`w-full text-center font-bold text-sm px-4 py-2.5 rounded-full transition-colors ${
                    isPopular ? 'bg-brand-black text-white hover:bg-gray-800' : 'bg-brand-zalo text-white hover:bg-blue-700'
                  }`}>
                  Chọn Loại Tròng Này
                </Link>
              </div>
            )
          })}
        </div>
        <p className="text-center text-xs text-brand-muted mt-5">
          <Link href="/trong-kinh" className="underline hover:text-brand-black">Xem chi tiết bảng giá →</Link>
        </p>
      </div>
    </section>
  )
}
