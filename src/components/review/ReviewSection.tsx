'use client'

import { useState, useEffect, useRef } from 'react'
import { formatVND } from '@/lib/utils'

interface Review {
  id: string
  productId: string
  name: string
  phone: string
  rating: number
  text: string
  images: string[]
  createdAt: string
  verified: boolean
}

interface ReviewSectionProps {
  productId?: string
  maxDisplay?: number
  hideForm?: boolean
}

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'xs' }) {
  return (
    <span className={`flex gap-0.5 ${size === 'xs' ? 'text-[10px]' : 'text-sm'}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
      ))}
    </span>
  )
}

function ReviewForm({ productId, onSubmitted }: { productId?: string; onSubmitted: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', rating: 5, text: '' })
  const [images, setImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    Array.from(files).slice(0, 3 - images.length).forEach(file => {
      const reader = new FileReader()
      reader.onload = () => setImages(prev => [...prev.slice(0, 2), reader.result as string])
      reader.readAsDataURL(file)
    })
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.phone.trim() || !form.text.trim() || submitting) return
    setSubmitting(true)
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, productId: productId ?? 'general', images }),
      })
      setDone(true)
      onSubmitted()
    } catch {}
    setSubmitting(false)
  }

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <p className="font-bold text-green-800 mb-1">Cảm ơn bạn đã đánh giá!</p>
        <p className="text-xs text-green-600">Đánh giá của bạn đã được ghi nhận.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 space-y-3">
      <p className="font-bold text-sm text-brand-black">Viết đánh giá của bạn</p>

      {/* Rating */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-brand-muted">Chất lượng:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <button key={i} onClick={() => setForm(f => ({ ...f, rating: i }))}
              className={`text-xl transition-colors ${i <= form.rating ? 'text-yellow-400' : 'text-gray-200'}`}>
              ★
            </button>
          ))}
        </div>
      </div>

      <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        placeholder="Họ tên *" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-zalo" />

      <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
        placeholder="Số điện thoại * (sẽ được ẩn)" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-zalo" />

      <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} rows={3}
        placeholder="Chia sẻ trải nghiệm sử dụng kính *" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-zalo resize-none" />

      {/* Images */}
      <div>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImage} className="hidden" />
        <div className="flex gap-2 items-center">
          {images.map((img, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                className="absolute top-0 right-0 bg-black/50 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-bl">×</button>
            </div>
          ))}
          {images.length < 3 && (
            <button onClick={() => fileRef.current?.click()}
              className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-brand-zalo hover:text-brand-zalo transition-colors">
              <span className="text-lg">📷</span>
              <span className="text-[9px]">Thêm ảnh</span>
            </button>
          )}
        </div>
      </div>

      <button onClick={handleSubmit}
        disabled={!form.name.trim() || !form.phone.trim() || !form.text.trim() || submitting}
        className="w-full bg-brand-zalo hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed">
        {submitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
      </button>
    </div>
  )
}

export default function ReviewSection({ productId, maxDisplay, hideForm }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loaded, setLoaded] = useState(false)

  function fetchReviews() {
    const url = productId ? `/api/reviews?productId=${productId}` : '/api/reviews'
    fetch(url)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setReviews(data) })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }

  useEffect(() => { fetchReviews() }, [productId])

  const displayReviews = maxDisplay ? reviews.slice(0, maxDisplay) : reviews
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0'

  if (!loaded) return null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-brand-black">Đánh giá từ khách hàng</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <Stars rating={Math.round(parseFloat(avgRating))} />
              <span className="text-xs text-brand-muted">{avgRating}/5 ({reviews.length} đánh giá)</span>
            </div>
          )}
        </div>
        {!hideForm && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="text-xs sm:text-sm font-bold text-brand-zalo hover:underline">
            ✍️ Viết đánh giá
          </button>
        )}
      </div>

      {/* Form */}
      {!hideForm && showForm && (
        <ReviewForm productId={productId} onSubmitted={() => { setShowForm(false); fetchReviews() }} />
      )}

      {/* List */}
      {displayReviews.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 text-center">
          <p className="font-bold text-brand-black mb-1">Chưa có đánh giá</p>
          <p className="text-xs text-brand-muted mb-3">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
          {!hideForm && !showForm && (
            <button onClick={() => setShowForm(true)}
              className="text-sm font-bold text-brand-zalo hover:underline">
              ✍️ Viết đánh giá đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayReviews.map(r => (
            <div key={r.id} className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {r.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{r.name}</span>
                    {r.verified && <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">✓ Đã mua</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Stars rating={r.rating} size="xs" />
                    <span className="text-[10px] text-brand-muted">
                      {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-brand-black leading-relaxed">{r.text}</p>
              {r.images.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {r.images.map((img, i) => (
                    <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
