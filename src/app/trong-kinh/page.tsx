import Link from 'next/link'
import { kvGet, KV_KEYS } from '@/lib/kv-store'
import lensDataFallback from '@/data/lens-products.json'

export const revalidate = 300

const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

interface TierItem { id: string; tierValue?: number; name: string; desc?: string; price: number; badge?: string; features?: string[] }

const FALLBACK_TIERS: TierItem[] = lensDataFallback as TierItem[]

export default async function TrongKinhPage() {
  const raw = (await kvGet<TierItem[]>(KV_KEYS.lensProducts, 'lens-products.json')) ?? FALLBACK_TIERS
  const valid = raw.filter(i => i.tierValue === 350000 || i.tierValue === 650000 || i.tierValue === 900000)
  const tiers = FALLBACK_TIERS.map(def => valid.find(v => v.tierValue === def.tierValue) ?? def)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-brand-black mb-2">Cắt Kính Tiền Trăm Dùng Vài Năm</h1>
        <p className="text-brand-muted">Chọn 1 trong 3 mức tròng — gọng được tặng kèm miễn phí</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {tiers.map(t => {
          const isPopular = t.tierValue === 650000
          const freeShip = (t.tierValue ?? 0) >= 650000
          return (
            <div key={t.id}
              className={`bg-white rounded-2xl border-2 p-6 flex flex-col relative ${isPopular ? 'border-brand-black shadow-lg sm:-translate-y-2' : 'border-brand-border'}`}>
              {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs bg-brand-black text-white font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  ⭐ Phổ biến nhất
                </span>
              )}
              <h2 className="font-bold text-brand-black text-lg text-center mt-2">{t.name}</h2>
              <p className="text-3xl font-black text-brand-black text-center my-3">{fmt(t.price)}</p>
              <p className="text-xs text-center text-brand-muted mb-4">🎁 Tặng kèm gọng kính bạn chọn</p>
              {freeShip && <p className="text-xs text-center text-green-600 font-semibold mb-4">🚚 Miễn phí vận chuyển</p>}

              {(t.features?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                  {t.features!.map(f => (
                    <span key={f} className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-200">✓ {f}</span>
                  ))}
                </div>
              )}

              <Link href={`/gong-kinh?tier=${t.tierValue}`}
                className={`mt-auto text-center font-bold px-4 py-3 rounded-full transition-colors ${
                  isPopular ? 'bg-brand-black text-white hover:bg-gray-800' : 'bg-brand-zalo text-white hover:bg-blue-700'
                }`}>
                Chọn Loại Tròng Này
              </Link>
            </div>
          )
        })}
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center text-xs text-amber-800">
        Độ cận &gt; -6.00 diop hoặc độ loạn &gt; -2.00 diop: phụ phí +100.000đ (áp dụng ở bước đặt hàng)
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6 text-center">
          <p className="text-lg font-bold mb-2 text-gray-900">Chỉ cần mua gọng, không cần tròng?</p>
          <p className="text-gray-500 text-sm mb-4">Mua gọng riêng, trả đúng giá niêm yết — đổi trả miễn phí trong 7 ngày</p>
          <Link href="/gong-kinh" className="inline-block bg-white border border-brand-border text-brand-black font-bold px-6 py-3 rounded-full hover:border-brand-black transition-colors">
            Xem Gọng Kính →
          </Link>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-center">
          <p className="text-lg font-bold mb-2 text-gray-900">Đã có gọng, chỉ cần thay tròng?</p>
          <p className="text-gray-500 text-sm mb-4">Gửi gọng kính đang đeo về SONi — thay tròng mới từ 290k</p>
          <Link href="/thay-trong" className="inline-block bg-white border border-brand-border text-brand-black font-bold px-6 py-3 rounded-full hover:border-brand-black transition-colors">
            Thay Tròng Ngay →
          </Link>
        </div>
      </div>
    </div>
  )
}
