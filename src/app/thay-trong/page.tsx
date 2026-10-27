'use client'

import { useState } from 'react'
import { formatVND } from '@/lib/utils'

interface Tier { tier: 290000 | 490000 | 690000; name: string; price: number }

const TIERS: Tier[] = [
  { tier: 290000, name: 'Tròng Chiết Suất 1.61', price: 290000 },
  { tier: 490000, name: 'Tròng Chiết Suất 1.67', price: 490000 },
  { tier: 690000, name: 'Tròng Chiết Suất 1.71', price: 690000 },
]

const RX_SURCHARGE = 100000

interface EyeRx { sph: string; cyl: string; axis: string }
const EMPTY_RX: EyeRx = { sph: '0', cyl: '0', axis: '0' }

function isHighRx(rx: EyeRx): boolean {
  const sph = parseFloat(rx.sph) || 0
  const cyl = parseFloat(rx.cyl) || 0
  return sph < -6.0 || cyl < -2.0
}

function EyeInput({ label, rx, onChange }: { label: string; rx: EyeRx; onChange: (r: EyeRx) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2 items-center">
      <span className="text-xs font-bold text-brand-black">{label}</span>
      <div>
        <label className="text-[10px] text-brand-muted block mb-0.5">SPH</label>
        <input type="number" step={0.25} value={rx.sph} onChange={e => onChange({ ...rx, sph: e.target.value })}
          className="w-full border border-brand-border rounded-lg px-2 py-1.5 text-xs text-center outline-none focus:border-brand-black" />
      </div>
      <div>
        <label className="text-[10px] text-brand-muted block mb-0.5">CYL</label>
        <input type="number" step={0.25} value={rx.cyl} onChange={e => onChange({ ...rx, cyl: e.target.value })}
          className="w-full border border-brand-border rounded-lg px-2 py-1.5 text-xs text-center outline-none focus:border-brand-black" />
      </div>
      <div>
        <label className="text-[10px] text-brand-muted block mb-0.5">Trục</label>
        <input type="number" step={1} min={0} max={180} value={rx.axis} onChange={e => onChange({ ...rx, axis: e.target.value })}
          className="w-full border border-brand-border rounded-lg px-2 py-1.5 text-xs text-center outline-none focus:border-brand-black" />
      </div>
    </div>
  )
}

export default function ThayTrongPage() {
  const [tier, setTier] = useState<Tier>(TIERS[1])
  const [rxRight, setRxRight] = useState<EyeRx>(EMPTY_RX)
  const [rxLeft, setRxLeft] = useState<EyeRx>(EMPTY_RX)
  const [pd, setPd] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', frameDesc: '', note: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [done, setDone] = useState(false)
  const [orderCode, setOrderCode] = useState('')

  const rxSurcharge = isHighRx(rxRight) || isHighRx(rxLeft) ? RX_SURCHARGE : 0
  const total = tier.price + rxSurcharge

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Vui lòng nhập họ tên'
    if (!/^0\d{9}$/.test(form.phone.trim())) e.phone = 'Số điện thoại không hợp lệ'
    if (!form.address.trim()) e.address = 'Vui lòng nhập địa chỉ nhận lại kính'
    if (!form.frameDesc.trim()) e.frameDesc = 'Vui lòng mô tả gọng kính bạn sẽ gửi (hãng, màu, tình trạng)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSubmitting(true)
    setSubmitError('')
    const code = 'SONI-TT' + Date.now().toString().slice(-7)

    try {
      await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderCode: code,
          orderType: 'thay-trong',
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          note: `[Thay tròng] Gọng khách gửi: ${form.frameDesc}. ${form.note}`,
          product: `Thay tròng — ${tier.name}`,
          lens: tier.name,
          packageTier: tier.tier,
          rxSurcharge,
          prescription: `MP: SPH ${rxRight.sph} / CYL ${rxRight.cyl} / Trục ${rxRight.axis} | MT: SPH ${rxLeft.sph} / CYL ${rxLeft.cyl} / Trục ${rxLeft.axis}${pd ? ` | PD: ${pd}mm` : ''}`,
          rxRight: { sph: parseFloat(rxRight.sph) || 0, cyl: parseFloat(rxRight.cyl) || 0, axis: parseInt(rxRight.axis, 10) || 0 },
          rxLeft: { sph: parseFloat(rxLeft.sph) || 0, cyl: parseFloat(rxLeft.cyl) || 0, axis: parseInt(rxLeft.axis, 10) || 0 },
          pd: pd ? parseFloat(pd) : undefined,
          total: formatVND(total),
          payment: 'COD - Thu hộ khi giao trả kính',
          payAmount: total,
          orderAmount: total,
          paymentType: 'cod',
        }),
      })
      setOrderCode(code)
      setDone(true)
    } catch {
      setSubmitError('Có lỗi kết nối, vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-xl font-black text-brand-black">Đặt Thay Tròng Thành Công!</p>
        <p className="text-sm text-brand-muted mt-1">Mã đơn: <strong className="text-brand-black">{orderCode}</strong></p>
        <p className="text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mt-4">
          📞 Nhân viên SONi sẽ liên hệ Zalo/điện thoại để hướng dẫn gửi gọng kính về xưởng cắt.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-brand-black mb-1">Thay Tròng Cho Gọng Cũ</h1>
        <p className="text-sm text-brand-muted">Gửi gọng kính đang đeo về SONi — thay tròng mới, không cần mua gọng mới</p>
      </div>

      <div className="space-y-2.5 mb-6">
        {TIERS.map(t => (
          <button key={t.tier} onClick={() => setTier(t)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
              tier.tier === t.tier ? 'border-brand-black bg-gray-50' : 'border-brand-border hover:border-gray-400'
            } ${t.tier === 490000 ? 'relative' : ''}`}>
            <div>
              <p className="font-bold text-sm text-brand-black">{t.name}</p>
              {t.tier === 490000 && <span className="text-[10px] bg-brand-black text-white font-bold px-1.5 py-0.5 rounded-full mt-1 inline-block">⭐ Phổ biến nhất</span>}
            </div>
            <span className="font-black text-sm text-brand-black">{formatVND(t.price)}</span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-bold text-brand-black block mb-1.5">Mô tả gọng kính sẽ gửi *</label>
          <input type="text" placeholder="VD: Gọng titan màu đen, hiệu XYZ, còn mới 90%" value={form.frameDesc}
            onChange={e => setForm(f => ({ ...f, frameDesc: e.target.value }))}
            className={`w-full border rounded-xl px-4 py-3 text-sm outline-none ${errors.frameDesc ? 'border-red-400 bg-red-50' : 'border-brand-border focus:border-brand-black'}`} />
          {errors.frameDesc && <p className="text-xs text-red-500 mt-1">{errors.frameDesc}</p>}
        </div>

        <input type="text" placeholder="Họ và tên *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className={`w-full border rounded-xl px-4 py-3 text-sm outline-none ${errors.name ? 'border-red-400 bg-red-50' : 'border-brand-border focus:border-brand-black'}`} />
        {errors.name && <p className="text-xs text-red-500 -mt-2">{errors.name}</p>}

        <input type="tel" placeholder="Số điện thoại *" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          className={`w-full border rounded-xl px-4 py-3 text-sm outline-none ${errors.phone ? 'border-red-400 bg-red-50' : 'border-brand-border focus:border-brand-black'}`} />
        {errors.phone && <p className="text-xs text-red-500 -mt-2">{errors.phone}</p>}

        <input type="email" placeholder="Email (không bắt buộc)" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-black" />

        <textarea placeholder="Địa chỉ nhận lại kính sau khi thay tròng *" rows={2} value={form.address}
          onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
          className={`w-full border rounded-xl px-4 py-3 text-sm outline-none resize-none ${errors.address ? 'border-red-400 bg-red-50' : 'border-brand-border focus:border-brand-black'}`} />
        {errors.address && <p className="text-xs text-red-500 -mt-2">{errors.address}</p>}

        <div className="border border-brand-border rounded-2xl p-4 space-y-3">
          <p className="text-sm font-bold text-brand-black">Thông số độ mắt</p>
          <EyeInput label="Mắt P" rx={rxRight} onChange={setRxRight} />
          <EyeInput label="Mắt T" rx={rxLeft} onChange={setRxLeft} />
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-brand-black w-16">PD (mm)</label>
            <input type="number" step={0.5} placeholder="54-74" value={pd} onChange={e => setPd(e.target.value)}
              className="border border-brand-border rounded-lg px-2 py-1.5 text-xs text-center outline-none focus:border-brand-black w-24" />
          </div>
          <p className="text-[10px] text-brand-muted bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
            💡 Có thể đo lại từ kính cũ hoặc đơn thuốc gần nhất. Độ cận &gt; -6.00 hoặc loạn &gt; -2.00: phụ phí +{formatVND(RX_SURCHARGE)}.
          </p>
        </div>

        <textarea placeholder="Ghi chú thêm (tuỳ chọn)" rows={2} value={form.note}
          onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
          className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm outline-none resize-none focus:border-brand-black" />

        <div className="bg-brand-light rounded-2xl p-4 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-brand-muted">{tier.name}</span><span className="font-semibold">{formatVND(tier.price)}</span></div>
          {rxSurcharge > 0 && (
            <div className="flex justify-between"><span className="text-amber-700">Phụ phí độ cao</span><span className="font-semibold text-amber-700">+{formatVND(rxSurcharge)}</span></div>
          )}
          <div className="flex justify-between border-t border-brand-border pt-1.5">
            <span className="font-bold text-brand-black">Tổng (thu khi giao trả kính)</span>
            <span className="font-black text-red-600">{formatVND(total)}</span>
          </div>
        </div>

        {submitError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{submitError}</p>}

        <button onClick={handleSubmit} disabled={submitting}
          className="w-full bg-brand-black hover:bg-gray-800 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all">
          {submitting ? 'Đang gửi...' : 'Đặt Thay Tròng'}
        </button>
      </div>
    </div>
  )
}
