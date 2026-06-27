'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useCart } from '@/lib/cartStore'
import { formatVND } from '@/lib/utils'
import { openZaloDefault } from '@/lib/zalo'
import LensPicker from '@/components/cart/LensPicker'
import RxInput from '@/components/cart/RxInput'

interface CheckoutOverlayProps {
  onClose: () => void
}

type Step = 'cart' | 'info' | 'success'

export default function CheckoutOverlay({ onClose }: CheckoutOverlayProps) {
  const { items, removeItem, updateQuantity, setLens, setRx, totalItems, totalPrice, clearCart } = useCart()
  const hasLens = items.some(i => !!i.lens)
  const totalLensPrice50 = Math.round(items.reduce((s, i) => s + (i.lens?.price ?? 0) * i.quantity, 0) * 0.8 * 0.5)

  const [step, setStep] = useState<Step>('cart')
  const [form, setForm] = useState({ name: '', phone: '', address: '', note: '', payment: hasLens ? 'deposit-bank' : 'cod' })
  const [submitting, setSubmitting] = useState(false)
  const [orderCode, setOrderCode] = useState('')
  const [error, setError] = useState('')
  const [lensPickerFor, setLensPickerFor] = useState<{ productId: string; colorId: string } | null>(null)
  const [rxInputFor, setRxInputFor] = useState<{ productId: string; colorId: string } | null>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    if (hasLens && form.payment === 'cod') setForm(f => ({ ...f, payment: 'deposit-bank' }))
    if (!hasLens && form.payment !== 'cod' && form.payment !== 'full-bank') setForm(f => ({ ...f, payment: 'cod' }))
  }, [hasLens, form.payment])

  const canSubmit = form.name.trim() && form.phone.trim().length >= 9 && form.address.trim() && items.length > 0

  async function handleSubmit() {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setError('')
    const code = `GH${Date.now().toString(36).toUpperCase()}`
    setOrderCode(code)

    const itemsSummary = items.map(i => {
      const lensText = i.lens ? ` + ${i.lens.name} (${formatVND(i.lens.price)})` : ''
      const lineTotal = (i.price + (i.lens?.price ?? 0)) * i.quantity
      return `${i.productName} (${i.colorName})${lensText} x${i.quantity} — ${formatVND(lineTotal)}`
    }).join('\n')

    try {
      for (const item of items) {
        const lensPrice = item.lens?.price ?? 0
        const lineTotal = (item.price + lensPrice) * item.quantity
        await fetch('/api/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderCode: items.length > 1 ? `${code}-${item.productId.slice(-4)}` : code,
            name: form.name, phone: form.phone, email: '', address: form.address,
            note: items.length > 1 ? `[Đơn gộp ${code}] ${items.length} SP\n${itemsSummary}\n---\n${form.note}` : form.note,
            product: item.productName, productId: item.productId,
            color: item.colorName, colorHex: item.colorHex, variantId: item.colorId,
            lens: item.lens ? item.lens.name : 'Chỉ Gọng',
            total: formatVND(lineTotal),
            originalTotal: formatVND((item.originalPrice ?? item.price) * item.quantity),
            discount: '20%',
            payment: form.payment === 'cod' ? 'COD'
              : form.payment === 'deposit-bank' ? `Cọc 50% tròng ${formatVND(Math.round(lensPrice * 0.8 * 0.5))} - CK`
              : `Toàn bộ ${formatVND(lineTotal)} - CK`,
            payAmount: form.payment === 'deposit-bank' ? Math.round(lensPrice * 0.8 * 0.5) : lineTotal,
            prescription: item.rx
              ? item.rx.mode === 'form'
                ? `MP: SPH ${item.rx.rightSph} / CYL ${item.rx.rightCyl} / Trục ${item.rx.rightAxis} | MT: SPH ${item.rx.leftSph} / CYL ${item.rx.leftCyl} / Trục ${item.rx.leftAxis}${item.rx.pd ? ` | PD: ${item.rx.pd}` : ''}`
                : item.rx.mode === 'image' ? 'Đã gửi ảnh toa thuốc' : 'Báo số độ sau qua Zalo'
              : '',
            prescriptionImage: item.rx?.mode === 'image' ? (item.rx.imageBase64 ?? '') : '',
            ...(item.rx?.mode === 'form' ? {
              rxRight: { sph: item.rx.rightSph, cyl: item.rx.rightCyl, axis: item.rx.rightAxis },
              rxLeft: { sph: item.rx.leftSph, cyl: item.rx.leftCyl, axis: item.rx.leftAxis },
              pd: item.rx.pd === 'Auto' ? undefined : parseInt(item.rx.pd ?? '0'),
            } : {}),
            variantIds: [item.colorId],
            affiliateCode: typeof window !== 'undefined' ? (localStorage.getItem('affiliateRef') ?? '') : '',
            orderAmount: lineTotal,
            paymentType: form.payment === 'cod' ? 'cod' : 'prepaid',
          }),
        })
      }
      clearCart()
      setStep('success')
    } catch {
      setError('Có lỗi kết nối, vui lòng thử lại.')
    }
    setSubmitting(false)
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-extrabold mb-2">Đặt Hàng Thành Công!</h2>
          <p className="text-sm text-brand-muted mb-1">Mã đơn: <strong>{orderCode}</strong></p>
          <p className="text-sm text-brand-muted mb-6">SONi sẽ liên hệ qua Zalo/điện thoại để xác nhận đơn hàng.</p>
          <div className="space-y-2">
            <button onClick={openZaloDefault}
              className="w-full bg-brand-zalo text-white font-bold py-3 rounded-2xl text-sm">Nhắn Zalo SONi</button>
            <button onClick={onClose}
              className="w-full border border-gray-200 font-semibold py-3 rounded-2xl text-sm hover:bg-gray-50">Quay lại trang</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={onClose} className="p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="font-extrabold text-base">{step === 'cart' ? `Giỏ Hàng (${totalItems})` : 'Thông Tin Đặt Hàng'}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
      <div className="max-w-md mx-auto px-4 space-y-3">
        {step === 'cart' && (
          <>
            {items.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🛒</div>
                <p className="text-sm text-brand-muted">Giỏ hàng trống</p>
              </div>
            ) : items.map(item => {
              const itemTotal = item.price + (item.lens?.price ?? 0)
              return (
                <div key={`${item.productId}-${item.colorId}`} className="bg-white rounded-2xl p-3 shadow-sm">
                  <div className="flex gap-3">
                    <div className="relative w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.productName} fill className="object-contain p-1" sizes="80px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold line-clamp-2 leading-tight">{item.productName}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: item.colorHex }} />
                        <span className="text-[11px] text-brand-muted">{item.colorName}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-extrabold">{formatVND(itemTotal)}</span>
                        <div className="flex items-center">
                          <button onClick={() => updateQuantity(item.productId, item.colorId, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-l-lg bg-gray-100 text-xs font-bold">−</button>
                          <span className="w-8 h-7 flex items-center justify-center bg-white text-xs font-bold border-y border-gray-100">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, item.colorId, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-r-lg bg-gray-100 text-xs font-bold">+</button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.productId, item.colorId)} className="self-start text-gray-300 hover:text-red-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Chọn tròng */}
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    {item.lens ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">🔵 Tròng</span>
                          <span className="text-xs font-semibold">{item.lens.name}</span>
                          <span className="text-[10px] text-brand-muted">+{formatVND(item.lens.price)}</span>
                        </div>
                        <button onClick={() => setLensPickerFor({ productId: item.productId, colorId: item.colorId })}
                          className="text-[10px] text-brand-zalo font-semibold">Đổi</button>
                      </div>
                    ) : (
                      <button onClick={() => setLensPickerFor({ productId: item.productId, colorId: item.colorId })}
                        className="w-full py-2.5 bg-blue-50 border-2 border-blue-400 rounded-xl text-xs font-bold text-blue-600 flex items-center justify-center gap-1.5 animate-pulse hover:bg-blue-100 transition-colors">
                        🔵 Chọn tròng cắt kính
                      </button>
                    )}
                  </div>

                  {/* Rx */}
                  {item.lens && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      {item.rx ? (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
                            {item.rx.mode === 'form' ? '✅ Đã nhập độ' : item.rx.mode === 'image' ? '📷 Đã chụp toa' : '💬 Báo sau'}
                          </span>
                          <button onClick={() => setRxInputFor({ productId: item.productId, colorId: item.colorId })}
                            className="text-[10px] text-brand-zalo font-semibold">Sửa</button>
                        </div>
                      ) : (
                        <button onClick={() => setRxInputFor({ productId: item.productId, colorId: item.colorId })}
                          className="w-full py-2.5 bg-green-50 border-2 border-green-400 rounded-xl text-xs font-bold text-green-600 flex items-center justify-center gap-1.5 animate-pulse hover:bg-green-100 transition-colors">
                          📝 Khai báo số độ
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        {step === 'info' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
            <button onClick={() => setStep('cart')} className="text-xs text-brand-zalo font-semibold">← Quay lại giỏ hàng</button>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Họ tên *" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-zalo" />
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="Số điện thoại *" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-zalo" />
            <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="Địa chỉ nhận hàng *" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-zalo" />
            <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={2}
              placeholder="Ghi chú (không bắt buộc)" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-zalo resize-none" />

            <div>
              <p className="text-xs font-bold text-gray-600 mb-2">Phương thức thanh toán</p>
              {hasLens && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-2 text-[11px] text-amber-800">
                  ⚠️ Đơn có tròng cắt theo số độ — cần cọc hoặc thanh toán trước.
                </div>
              )}
              <div className="space-y-2">
                {!hasLens && (
                  <label className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm cursor-pointer ${form.payment === 'cod' ? 'border-brand-zalo bg-blue-50' : 'border-gray-200'}`}>
                    <input type="radio" name="pay" checked={form.payment === 'cod'} onChange={() => setForm(f => ({ ...f, payment: 'cod' }))} className="accent-brand-zalo" />
                    <span className="font-semibold">💵 COD — Trả khi nhận hàng</span>
                  </label>
                )}
                {hasLens && (
                  <label className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm cursor-pointer ${form.payment === 'deposit-bank' ? 'border-brand-zalo bg-blue-50' : 'border-gray-200'}`}>
                    <input type="radio" name="pay" checked={form.payment === 'deposit-bank'} onChange={() => setForm(f => ({ ...f, payment: 'deposit-bank' }))} className="accent-brand-zalo" />
                    <div>
                      <span className="font-semibold block">🏦 Cọc 50% tiền tròng</span>
                      <span className="text-[10px] text-brand-muted">Cọc {formatVND(totalLensPrice50)} — trả phần còn lại khi nhận</span>
                    </div>
                  </label>
                )}
                <label className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm cursor-pointer ${form.payment === 'full-bank' ? 'border-brand-zalo bg-blue-50' : 'border-gray-200'}`}>
                  <input type="radio" name="pay" checked={form.payment === 'full-bank'} onChange={() => setForm(f => ({ ...f, payment: 'full-bank' }))} className="accent-brand-zalo" />
                  <span className="font-semibold">🏦 Thanh toán toàn bộ — Ưu tiên xử lý</span>
                </label>
              </div>
            </div>
            {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
          </div>
        )}
      </div>
      </div>

      {/* Bottom bar */}
      {items.length > 0 && (
        <div className="bg-white border-t border-gray-100 px-4 py-3 pb-safe">
          <div className="max-w-md mx-auto space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-brand-muted">Tổng: {totalItems} sản phẩm</span>
            <span className="text-lg font-extrabold">{formatVND(totalPrice)}</span>
          </div>
          {step === 'cart' ? (
            <button onClick={() => setStep('info')}
              className="cta-pulse w-full bg-red-500 hover:bg-red-600 text-white font-extrabold py-4 rounded-2xl text-base transition active:scale-95 shadow-lg flex items-center justify-center gap-2">
              Tiến Hành Đặt Hàng <span className="text-lg">→</span>
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!canSubmit || submitting}
              className="cta-pulse w-full bg-red-500 hover:bg-red-600 text-white font-extrabold py-4 rounded-2xl text-base transition active:scale-95 shadow-lg disabled:bg-gray-300 disabled:animate-none">
              {submitting ? 'Đang xử lý...' : 'Xác Nhận Đặt Hàng ✓'}
            </button>
          )}
          </div>
        </div>
      )}

      {lensPickerFor && (
        <LensPicker
          currentLens={items.find(i => i.productId === lensPickerFor.productId && i.colorId === lensPickerFor.colorId)?.lens}
          onSelect={(lens) => setLens(lensPickerFor.productId, lensPickerFor.colorId, lens)}
          onClose={() => setLensPickerFor(null)}
        />
      )}
      {rxInputFor && (
        <RxInput
          currentRx={items.find(i => i.productId === rxInputFor.productId && i.colorId === rxInputFor.colorId)?.rx}
          onSave={(rx) => setRx(rxInputFor.productId, rxInputFor.colorId, rx)}
          onClose={() => setRxInputFor(null)}
        />
      )}
    </div>
  )
}
