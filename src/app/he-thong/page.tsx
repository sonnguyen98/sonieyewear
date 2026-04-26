import Link from 'next/link'
import { kvGet, KV_KEYS } from '@/lib/kv-store'
import storesFallback from '@/data/stores.json'

interface Store { id: string; name: string; address: string; phone: string; hours: string; mapUrl: string; image: string; published: boolean }

export default async function HeThongPage() {
  const allStores: Store[] =
    (await kvGet<Store[]>(KV_KEYS.stores, 'stores.json')) ?? storesFallback
  const stores = allStores.filter(s => s.published)

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-brand-black mb-2">Hệ Thống Cửa Hàng</h1>
      <p className="text-brand-muted mb-8">Ghé thăm SONi Kính tại các địa điểm gần bạn nhất</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {stores.map(s => (
          <div key={s.id} className="bg-white rounded-2xl border border-brand-border p-5 hover:shadow-md transition-shadow">
            <h2 className="font-bold text-brand-black text-lg mb-3">{s.name}</h2>
            <div className="space-y-2 text-sm text-brand-muted">
              <p>📍 {s.address}</p>
              <p>📞 {s.phone}</p>
              <p>🕐 {s.hours}</p>
            </div>
            {s.mapUrl && (
              <Link href={s.mapUrl} target="_blank"
                className="mt-4 inline-flex items-center gap-1.5 text-brand-zalo text-sm font-semibold hover:underline">
                🗺️ Xem trên Google Maps →
              </Link>
            )}
          </div>
        ))}
      </div>
      {stores.length === 0 && (
        <div className="text-center py-16 text-brand-muted">
          <p className="text-4xl mb-3">🏪</p>
          <p>Đang cập nhật danh sách cửa hàng...</p>
        </div>
      )}
    </div>
  )
}
