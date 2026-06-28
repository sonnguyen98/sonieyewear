'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/lib/cartStore'
import { formatVND } from '@/lib/utils'
import { openZaloDefault } from '@/lib/zalo'
import LensPicker from '@/components/cart/LensPicker'
import RxInput from '@/components/cart/RxInput'

type CheckoutStep = 'cart' | 'info' | 'success'

interface CheckoutForm {
  name: string
  phone: string
  address: string
  note: string
  payment: 'cod' | 'deposit-bank' | 'full-bank'
}

export default function GioHangPage() {
  const { items, removeItem, updateQuantity, setLens, setRx, totalItems, totalPrice, clearCart } = useCart()
  const [step, setStep] = useState<CheckoutStep>('cart')
  const hasLens = items.some(i => !!i.lens)
  const deposit20 = Math.round(totalPrice * 0.2)
  const [form, setForm] = useState<CheckoutForm>({ name: '', phone: '', address: '', note: '', payment: 'cod' })
  const [submitting, setSubmitting] = useState(false)
  const [orderCode, setOrderCode] = useState('')
  const [error, setError] = useState('')
  const [lensPickerFor, setLensPickerFor] = useState<{ productId: string; colorId: string } | null>(null)
  const [rxInputFor, setRxInputFor] = useState<{ productId: string; colorId: string } | null>(null)

  const update = (field: keyof CheckoutForm, value: string) => setForm(f => ({ ...f, [field]: value }))

  useEffect(() => {
    if (hasLens && form.payment === 'cod') {
      setForm(f => ({ ...f, payment: 'deposit-bank' }))
    }
    if (!hasLens && form.payment !== 'cod' && form.payment !== 'full-bank') {
      setForm(f => ({ ...f, payment: 'cod' }))
    }
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
            name: form.name,
            phone: form.phone,
            email: '',
            address: form.address,
            note: items.length > 1
              ? `[Đơn gộp ${code}] ${items.length} sản phẩm\n${itemsSummary}\n---\nGhi chú: ${form.note}`
              : form.note,
            product: item.productName,
            productId: item.productId,
            color: item.colorName,
            colorHex: item.colorHex,
            variantId: item.colorId,
            lens: item.lens ? item.lens.name : 'Chỉ Gọng',
            total: formatVND(lineTotal),
            originalTotal: formatVND((item.originalPrice ?? item.price) * item.quantity),
            discount: item.originalPrice ? `${Math.round((1 - item.price / item.originalPrice) * 100)}%` : '0%',
            payment: form.payment === 'cod' ? 'Thanh toán khi nhận hàng (COD)'
              : form.payment === 'deposit-bank' ? `Thanh toán trước 20% ${formatVND(Math.round(lineTotal * 0.2))} - Chuyển khoản`
              : `Toàn bộ ${formatVND(lineTotal)} - Chuyển khoản`,
            payAmount: form.payment === 'deposit-bank' as string
              ? Math.round(lineTotal * 0.2)
              : lineTotal,
            prescription: item.rx
              ? item.rx.mode === 'form'
                ? `MP: SPH ${item.rx.rightSph} / CYL ${item.rx.rightCyl} / Trục ${item.rx.rightAxis} | MT: SPH ${item.rx.leftSph} / CYL ${item.rx.leftCyl} / Trục ${item.rx.leftAxis}${item.rx.pd ? ` | PD: ${item.rx.pd}` : ''}`
                : item.rx.mode === 'image' ? 'Đã gửi ảnh toa thuốc' : 'Khách sẽ báo số độ sau qua Zalo'
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

  // ── SUCCESS ──
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            ✅
          </div>
          <h1 className="text-2xl font-extrabold mb-2">Đặt Hàng Thành Công!</h1>
          <p className="text-brand-muted text-sm mb-4">
            Mã đơn: <strong className="text-brand-black">{orderCode}</strong>
          </p>
          <p className="text-sm text-brand-muted mb-6">
            SONi sẽ liên hệ qua Zalo/điện thoại để xác nhận đơn hàng và tư vấn chọn tròng kính phù hợp.
          </p>
          <div className="space-y-2">
            <button onClick={openZaloDefault}
              className="w-full bg-brand-zalo text-white font-bold py-3 rounded-2xl text-sm hover:bg-blue-700 transition-colors">
              Nhắn Zalo Để Chọn Tròng
            </button>
            <Link href="/gong-kinh" className="block w-full border border-gray-200 text-brand-black font-semibold py-3 rounded-2xl text-sm hover:bg-gray-50 transition-colors">
              Tiếp Tục Mua Sắm
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-extrabold mb-6">
          {step === 'cart' ? `Giỏ Hàng (${totalItems})` : 'Thông Tin Đặt Hàng'}
        </h1>

        {items.length === 0 && step === 'cart' ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <p className="text-lg font-bold text-brand-black mb-2">Giỏ hàng trống</p>
            <p className="text-sm text-brand-muted mb-6">Hãy thêm sản phẩm yêu thích vào giỏ hàng</p>
            <Link href="/gong-kinh" className="inline-block bg-brand-zalo text-white font-bold px-8 py-3 rounded-2xl text-sm hover:bg-blue-700 transition-colors">
              Xem Gọng Kính
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Items or Form */}
            <div className="lg:col-span-2 space-y-3">
              {step === 'cart' && items.map(item => {
                const itemTotal = item.price + (item.lens?.price ?? 0)
                return (
                  <div key={`${item.productId}-${item.colorId}`} className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex gap-4">
                      <Link href={`/gong-kinh/${item.productId}`} className="relative w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.productName} fill className="object-contain p-2" sizes="96px" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/gong-kinh/${item.productId}`} className="text-sm font-bold text-brand-black hover:underline line-clamp-2">
                          {item.productName}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: item.colorHex }} />
                          <span className="text-xs text-brand-muted">{item.colorName}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <span className="text-base font-extrabold text-brand-black">{formatVND(itemTotal)}</span>
                            {item.originalPrice && (
                              <span className="text-xs text-gray-400 line-through ml-1.5">{formatVND(item.originalPrice)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-0">
                            <button onClick={() => updateQuantity(item.productId, item.colorId, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-l-lg bg-gray-100 hover:bg-gray-200 text-sm font-bold">−</button>
                            <span className="w-10 h-8 flex items-center justify-center bg-white text-sm font-bold border-y border-gray-100">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, item.colorId, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-r-lg bg-gray-100 hover:bg-gray-200 text-sm font-bold">+</button>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.productId, item.colorId)} className="self-start p-1 text-gray-300 hover:text-red-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Chọn tròng */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {item.lens ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">🔵 Tròng</span>
                            <span className="text-sm font-semibold text-brand-black">{item.lens.name}</span>
                            <span className="text-xs text-brand-muted">+{formatVND(item.lens.price)}</span>
                          </div>
                          <button
                            onClick={() => setLensPickerFor({ productId: item.productId, colorId: item.colorId })}
                            className="text-xs text-brand-zalo font-semibold hover:underline"
                          >Đổi tròng</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setLensPickerFor({ productId: item.productId, colorId: item.colorId })}
                          className="w-full py-2.5 border-2 border-dashed border-blue-300 rounded-xl text-sm font-semibold text-brand-zalo hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                          Chọn tròng cắt kính
                        </button>
                      )}
                    </div>

                    {/* Khai báo số độ — chỉ hiện khi đã chọn tròng */}
                    {item.lens && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        {item.rx ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                                {item.rx.mode === 'form' ? '✅ Đã nhập số độ' : item.rx.mode === 'image' ? '📷 Đã chụp toa' : '💬 Báo sau qua Zalo'}
                              </span>
                              {item.rx.mode === 'form' && (
                                <span className="text-[10px] text-brand-muted">
                                  MP: {item.rx.rightSph} | MT: {item.rx.leftSph}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => setRxInputFor({ productId: item.productId, colorId: item.colorId })}
                              className="text-xs text-brand-zalo font-semibold hover:underline"
                            >Sửa</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRxInputFor({ productId: item.productId, colorId: item.colorId })}
                            className="w-full py-2 border-2 border-dashed border-green-300 rounded-xl text-sm font-semibold text-green-600 hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Khai báo số độ
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {step === 'info' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
                  <button onClick={() => setStep('cart')} className="text-sm text-brand-zalo font-semibold hover:underline mb-2">
                    ← Quay lại giỏ hàng
                  </button>

                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Họ tên *</label>
                    <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-brand-zalo focus:ring-1 focus:ring-brand-zalo/30 outline-none" placeholder="Nguyễn Văn A" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Số điện thoại *</label>
                    <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-brand-zalo focus:ring-1 focus:ring-brand-zalo/30 outline-none" placeholder="0912 345 678" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Địa chỉ nhận hàng *</label>
                    <input type="text" value={form.address} onChange={e => update('address', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-brand-zalo focus:ring-1 focus:ring-brand-zalo/30 outline-none" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-1 block">Ghi chú</label>
                    <textarea value={form.note} onChange={e => update('note', e.target.value)} rows={2}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-brand-zalo focus:ring-1 focus:ring-brand-zalo/30 outline-none resize-none" placeholder="Ghi chú thêm (không bắt buộc)" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-600 mb-2 block">Phương thức thanh toán</label>

                    {hasLens && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-3 flex gap-2">
                        <span className="text-base flex-shrink-0">⚠️</span>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          Đơn có <strong>tròng cắt theo số độ</strong> — cần thanh toán trước 20% hoặc toàn bộ trước khi xưởng tiến hành cắt kính.
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {!hasLens && (
                        <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                          form.payment === 'cod' ? 'border-brand-zalo bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                        }`}>
                          <input type="radio" name="payment" value="cod" checked={form.payment === 'cod'}
                            onChange={() => update('payment', 'cod')} className="accent-brand-zalo" />
                          <span className="text-lg">💵</span>
                          <div>
                            <span className="text-sm font-semibold block">Thanh toán khi nhận hàng (COD)</span>
                            <span className="text-[11px] text-brand-muted">Kiểm tra hàng trước, trả tiền sau</span>
                          </div>
                        </label>
                      )}
                      {hasLens && (
                        <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                          form.payment === 'deposit-bank' ? 'border-brand-zalo bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                        }`}>
                          <input type="radio" name="payment" value="deposit-bank" checked={form.payment === 'deposit-bank'}
                            onChange={() => update('payment', 'deposit-bank')} className="accent-brand-zalo" />
                          <span className="text-lg">🏦</span>
                          <div>
                            <span className="text-sm font-semibold block">Thanh toán trước 20%</span>
                            <span className="text-[11px] text-brand-muted">
                              Thanh toán {formatVND(deposit20)} — trả 80% còn lại khi nhận hàng
                            </span>
                          </div>
                        </label>
                      )}
                      <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                        form.payment === 'full-bank' ? 'border-brand-zalo bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input type="radio" name="payment" value="full-bank" checked={form.payment === 'full-bank'}
                          onChange={() => update('payment', 'full-bank')} className="accent-brand-zalo" />
                        <span className="text-lg">🏦</span>
                        <div>
                          <span className="text-sm font-semibold block">Thanh toán toàn bộ</span>
                          <span className="text-[11px] text-brand-muted">Chuyển khoản 100% — ưu tiên xử lý đơn trước</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
                </div>
              )}
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-28 space-y-4">
                <h3 className="font-extrabold text-brand-black">Tóm tắt đơn hàng</h3>

                <div className="space-y-2 text-sm">
                  {items.map(item => {
                    const lineTotal = (item.price + (item.lens?.price ?? 0)) * item.quantity
                    return (
                      <div key={`${item.productId}-${item.colorId}`}>
                        <div className="flex justify-between gap-2">
                          <span className="text-brand-muted truncate">{item.productName} x{item.quantity}</span>
                          <span className="font-semibold whitespace-nowrap">{formatVND(lineTotal)}</span>
                        </div>
                        {item.lens && (
                          <p className="text-xs text-blue-600 ml-2">+ {item.lens.name}</p>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-brand-muted">Tạm tính</span>
                    <span className="font-semibold">{formatVND(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-brand-muted">Phí vận chuyển</span>
                    <span className="font-semibold text-green-600">Miễn phí</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold">Tổng cộng</span>
                  <span className="text-xl font-extrabold text-brand-black">{formatVND(totalPrice)}</span>
                </div>

                {step === 'info' && form.payment === 'deposit-bank' && deposit20 > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                    <p className="text-xs text-blue-800">
                      <strong>Thanh toán trước:</strong> {formatVND(deposit20)} (20% giá trị đơn)
                    </p>
                    <p className="text-[10px] text-blue-600">Phần còn lại thanh toán khi nhận hàng</p>
                  </div>
                )}

                <p className="text-[11px] text-brand-muted">
                  {hasLens ? 'Đơn có tròng cắt kính — cần thanh toán trước 20% hoặc toàn bộ.' : 'Bạn có thể chọn tròng cắt kính cho từng gọng ở giỏ hàng.'}
                </p>

                {step === 'cart' ? (
                  <button onClick={() => setStep('info')}
                    className="w-full bg-brand-zalo hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-base transition-all active:scale-95 shadow-lg">
                    Tiến Hành Đặt Hàng →
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={!canSubmit || submitting}
                    className="w-full bg-brand-zalo hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-base transition-all active:scale-95 shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed">
                    {submitting ? 'Đang xử lý...' : 'Xác Nhận Đặt Hàng'}
                  </button>
                )}

                <p className="text-center text-[11px] text-brand-muted">
                  🛡️ Đổi trả 7 ngày · Bảo hành 1 năm · Freeship
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

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
