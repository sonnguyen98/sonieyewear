'use client'

import { useState, useRef } from 'react'
import type { CartRx } from '@/lib/cartStore'

interface RxInputProps {
  currentRx?: CartRx
  onSave: (rx: CartRx) => void
  onClose: () => void
}

const SPH_OPTIONS = [
  '0.00 (Plano)', '-0.25', '-0.50', '-0.75',
  '-1.00', '-1.25', '-1.50', '-1.75', '-2.00', '-2.25', '-2.50', '-2.75',
  '-3.00', '-3.25', '-3.50', '-3.75', '-4.00', '-4.25', '-4.50', '-4.75',
  '-5.00', '-5.50', '-6.00', '-6.50', '-7.00', '-7.50', '-8.00', '-8.50',
  '-9.00', '-10.00', '-11.00', '-12.00',
]

const CYL_OPTIONS = [
  '0.00 (Không loạn)', '-0.25', '-0.50', '-0.75',
  '-1.00', '-1.25', '-1.50', '-1.75', '-2.00', '-2.50', '-3.00', '-3.50', '-4.00',
]

const AXIS_OPTIONS = Array.from({ length: 181 }, (_, i) => `${i}°`)

const PD_OPTIONS = ['Auto', '58mm', '60mm', '62mm', '64mm', '66mm', '68mm', '70mm']

export default function RxInput({ currentRx, onSave, onClose }: RxInputProps) {
  const [mode, setMode] = useState<'form' | 'image' | 'later'>(currentRx?.mode ?? 'form')
  const [rx, setRx] = useState({
    rightSph: currentRx?.rightSph ?? '0.00 (Plano)',
    rightCyl: currentRx?.rightCyl ?? '0.00 (Không loạn)',
    rightAxis: currentRx?.rightAxis ?? '0°',
    leftSph: currentRx?.leftSph ?? '0.00 (Plano)',
    leftCyl: currentRx?.leftCyl ?? '0.00 (Không loạn)',
    leftAxis: currentRx?.leftAxis ?? '0°',
    pd: currentRx?.pd ?? 'Auto',
  })
  const [imageBase64, setImageBase64] = useState(currentRx?.imageBase64 ?? '')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageBase64(reader.result as string)
    reader.readAsDataURL(file)
  }

  function handleSave() {
    if (mode === 'later') {
      onSave({ mode: 'later' })
    } else if (mode === 'image') {
      onSave({ mode: 'image', imageBase64 })
    } else {
      onSave({ mode: 'form', ...rx })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-extrabold">Khai Báo Số Độ</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Mode selector */}
          <div className="flex gap-2">
            {[
              { id: 'form' as const, label: 'Tự nhập số độ', icon: '📝' },
              { id: 'image' as const, label: 'Chụp toa/đơn thuốc', icon: '📷' },
              { id: 'later' as const, label: 'Báo sau qua Zalo', icon: '💬' },
            ].map(opt => (
              <button key={opt.id} onClick={() => setMode(opt.id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all text-center ${
                  mode === opt.id ? 'border-brand-zalo bg-blue-50 text-brand-zalo' : 'border-gray-200 text-brand-muted hover:border-gray-300'
                }`}>
                <span className="text-base block mb-0.5">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>

          {mode === 'form' && (
            <div className="space-y-4">
              {/* Mắt phải */}
              <div>
                <p className="text-xs font-bold text-brand-black mb-2">Mắt Phải (OD / R)</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-brand-muted block mb-1">SPH (Cận/Viễn)</label>
                    <select value={rx.rightSph} onChange={e => setRx(r => ({ ...r, rightSph: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs focus:border-brand-zalo outline-none">
                      {SPH_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-brand-muted block mb-1">CYL (Loạn)</label>
                    <select value={rx.rightCyl} onChange={e => setRx(r => ({ ...r, rightCyl: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs focus:border-brand-zalo outline-none">
                      {CYL_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-brand-muted block mb-1">Trục (Axis)</label>
                    <select value={rx.rightAxis} onChange={e => setRx(r => ({ ...r, rightAxis: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs focus:border-brand-zalo outline-none">
                      {AXIS_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Mắt trái */}
              <div>
                <p className="text-xs font-bold text-brand-black mb-2">Mắt Trái (OS / L)</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-brand-muted block mb-1">SPH (Cận/Viễn)</label>
                    <select value={rx.leftSph} onChange={e => setRx(r => ({ ...r, leftSph: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs focus:border-brand-zalo outline-none">
                      {SPH_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-brand-muted block mb-1">CYL (Loạn)</label>
                    <select value={rx.leftCyl} onChange={e => setRx(r => ({ ...r, leftCyl: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs focus:border-brand-zalo outline-none">
                      {CYL_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-brand-muted block mb-1">Trục (Axis)</label>
                    <select value={rx.leftAxis} onChange={e => setRx(r => ({ ...r, leftAxis: e.target.value }))}
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 text-xs focus:border-brand-zalo outline-none">
                      {AXIS_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* PD */}
              <div>
                <label className="text-xs font-bold text-brand-black block mb-2">Khoảng cách đồng tử (PD)</label>
                <select value={rx.pd} onChange={e => setRx(r => ({ ...r, pd: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs focus:border-brand-zalo outline-none">
                  {PD_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <p className="text-[10px] text-brand-muted mt-1">Nếu không biết PD, chọn &quot;Auto&quot; — SONi sẽ tư vấn.</p>
              </div>
            </div>
          )}

          {mode === 'image' && (
            <div className="space-y-3">
              <p className="text-xs text-brand-muted">Chụp ảnh toa thuốc / đơn kính cũ — SONi sẽ đọc số độ cho bạn.</p>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
              {imageBase64 ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageBase64} alt="Toa thuốc" className="w-full rounded-xl border border-gray-200" />
                  <button onClick={() => { setImageBase64(''); fileRef.current?.click() }}
                    className="absolute top-2 right-2 bg-white/90 text-xs font-semibold px-3 py-1.5 rounded-lg shadow hover:bg-white">
                    Chụp lại
                  </button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()}
                  className="w-full py-10 border-2 border-dashed border-gray-300 rounded-xl text-brand-muted hover:border-brand-zalo hover:text-brand-zalo transition-colors flex flex-col items-center gap-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-semibold">Chụp / chọn ảnh toa thuốc</span>
                </button>
              )}
            </div>
          )}

          {mode === 'later' && (
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm font-semibold text-brand-black mb-1">Báo số độ sau qua Zalo</p>
              <p className="text-xs text-brand-muted">
                Sau khi đặt hàng, SONi sẽ liên hệ bạn qua Zalo để lấy thông số độ trước khi cắt kính.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-4">
          <button onClick={handleSave}
            disabled={mode === 'image' && !imageBase64}
            className="w-full bg-brand-zalo hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-sm transition-all active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed">
            {mode === 'later' ? 'Xác nhận — Báo độ sau' : 'Lưu số độ'}
          </button>
        </div>
      </div>
    </div>
  )
}
