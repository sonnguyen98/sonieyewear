'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface EyeForm { sph: string; cyl: string; axis: string; add: string }
const defaultEye = (): EyeForm => ({ sph: '0', cyl: '0', axis: '0', add: '' })

function parseEye(e: EyeForm) {
  return {
    sph:  parseFloat(e.sph)  || 0,
    cyl:  parseFloat(e.cyl)  || 0,
    axis: parseInt(e.axis)   || 0,
    ...(e.add !== '' ? { add: parseFloat(e.add) } : {}),
  }
}

// ── Input số thông số mắt ────────────────────────────────────────────────────
function EyeInput({ label, value, onChange, min, max, step, unit, optional }: {
  label: string; value: string; onChange: (v: string) => void
  min: number; max: number; step: number; unit?: string; optional?: boolean
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-gray-500 mb-1">
        {label}{optional && <span className="font-normal text-gray-400 ml-1">(tùy chọn)</span>}
      </label>
      <div className="relative">
        <input
          type="number" value={value} min={min} max={max} step={step}
          onChange={e => onChange(e.target.value)}
          placeholder={optional ? '—' : '0'}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
        />
        {unit && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">{unit}</span>}
      </div>
    </div>
  )
}

// ── Block thông số 1 mắt ─────────────────────────────────────────────────────
function EyeSection({ title, color, data, onChange }: {
  title: string; color: string; data: EyeForm; onChange: (d: EyeForm) => void
}) {
  const set = (k: keyof EyeForm) => (v: string) => onChange({ ...data, [k]: v })
  return (
    <div className={`rounded-2xl border-2 ${color} p-4`}>
      <p className="text-xs font-black text-gray-700 mb-3 uppercase tracking-wide">{title}</p>
      <div className="grid grid-cols-3 gap-2 mb-2">
        <EyeInput label="SPH (độ cầu)"  value={data.sph}  onChange={set('sph')}  min={-20} max={20}  step={0.25}/>
        <EyeInput label="CYL (độ trụ)"  value={data.cyl}  onChange={set('cyl')}  min={-6}  max={6}   step={0.25}/>
        <EyeInput label="AXIS (trục)"   value={data.axis} onChange={set('axis')} min={0}   max={180} step={1} unit="°"/>
      </div>
      <EyeInput label="ADD (cộng thêm)" value={data.add} onChange={set('add')} min={0} max={4} step={0.25} optional/>
    </div>
  )
}

// ── Khu vực upload ảnh ───────────────────────────────────────────────────────
type OcrStatus = 'idle' | 'loading' | 'done' | 'error'

function OcrUploader({ onSuccess }: {
  onSuccess: (data: {
    right: { sph: number; cyl: number; axis: number; add: number | null }
    left:  { sph: number; cyl: number; axis: number; add: number | null }
    pd: number | null; examDate: string | null; clinicName: string | null
  }, imageUrl?: string) => void
}) {
  const [status, setStatus] = useState<OcrStatus>('idle')
  const [preview, setPreview] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function processFile(file: File) {
    setPreview(URL.createObjectURL(file))
    setStatus('loading')
    setErrorMsg('')

    const form = new FormData()
    form.append('image', file)

    const r = await fetch('/api/prescription/ocr', { method: 'POST', body: form })
    const json = await r.json()

    if (!r.ok) {
      setStatus('error')
      setErrorMsg(json.error ?? 'Đọc thất bại')
      return
    }
    setStatus('done')
    onSuccess(json.data, json.imageUrl)
  }

  function onFile(file: File | null | undefined) {
    if (!file) return
    if (!file.type.startsWith('image/')) { setErrorMsg('Vui lòng chọn file ảnh'); return }
    processFile(file)
  }

  return (
    <div>
      <input
        ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => onFile(e.target.files?.[0])}
      />

      {/* Drop zone */}
      <div
        onClick={() => status !== 'loading' && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); onFile(e.dataTransfer.files[0]) }}
        className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
          ${dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}
          ${status === 'loading' ? 'cursor-wait pointer-events-none' : ''}`}
      >
        {/* Preview ảnh */}
        {preview && (
          <img src={preview} alt="preview" className="w-full max-h-52 object-contain bg-gray-100"/>
        )}

        {/* Overlay loading */}
        {status === 'loading' && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
            <p className="text-xs font-semibold text-blue-600">Gemini đang đọc đơn kính...</p>
            <p className="text-[10px] text-gray-400">Khoảng 5–15 giây</p>
          </div>
        )}

        {/* Placeholder khi chưa có ảnh */}
        {!preview && status !== 'loading' && (
          <div className="py-10 flex flex-col items-center gap-2 text-center px-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700">Chụp hoặc tải ảnh đơn kính</p>
            <p className="text-xs text-gray-400">JPG, PNG, WebP, HEIC — tối đa 8MB</p>
          </div>
        )}
      </div>

      {/* Nút chụp lại */}
      {(status === 'done' || status === 'error') && (
        <button
          onClick={() => { setPreview(null); setStatus('idle'); setErrorMsg(''); inputRef.current?.click() }}
          className="mt-2 w-full py-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition-colors"
        >
          Chụp lại / Chọn ảnh khác
        </button>
      )}

      {/* Lỗi */}
      {status === 'error' && errorMsg && (
        <p className="mt-2 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl border border-red-100">{errorMsg}</p>
      )}

      {/* Thành công */}
      {status === 'done' && (
        <div className="mt-2 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2.5 rounded-xl border border-green-200">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
          </svg>
          Đã đọc xong! Kiểm tra lại các số bên dưới trước khi lưu.
        </div>
      )}
    </div>
  )
}

// ── Page chính ───────────────────────────────────────────────────────────────
type InputMode = 'manual' | 'ocr'

export default function ThemDonPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<InputMode>('manual')
  const [ocrDone, setOcrDone] = useState(false)
  const [pendingImageUrl, setPendingImageUrl] = useState<string | undefined>()

  // Form fields
  const [examDate, setExamDate] = useState(new Date().toISOString().slice(0, 10))
  const [clinicName, setClinicName] = useState('')
  const [right, setRight] = useState<EyeForm>(defaultEye())
  const [left,  setLeft]  = useState<EyeForm>(defaultEye())
  const [pd, setPd] = useState('')
  const [notes, setNotes] = useState('')

  // Auth check
  useEffect(() => {
    fetch('/api/customer/me').then(r => {
      if (!r.ok) router.replace('/so-y-ba')
      else setChecking(false)
    }).catch(() => router.replace('/so-y-ba'))
  }, [router])

  function handleOcrSuccess(
    data: { right: { sph: number; cyl: number; axis: number; add: number | null }; left: { sph: number; cyl: number; axis: number; add: number | null }; pd: number | null; examDate: string | null; clinicName: string | null },
    imageUrl?: string
  ) {
    setRight({
      sph:  String(data.right.sph),
      cyl:  String(data.right.cyl),
      axis: String(data.right.axis),
      add:  data.right.add != null ? String(data.right.add) : '',
    })
    setLeft({
      sph:  String(data.left.sph),
      cyl:  String(data.left.cyl),
      axis: String(data.left.axis),
      add:  data.left.add != null ? String(data.left.add) : '',
    })
    if (data.pd)         setPd(String(data.pd))
    if (data.examDate)   setExamDate(data.examDate)
    if (data.clinicName) setClinicName(data.clinicName)
    if (imageUrl) setPendingImageUrl(imageUrl)
    setOcrDone(true)
    // Cuộn xuống form để user kiểm tra
    setTimeout(() => document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)

    const r = await fetch('/api/prescription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        examDate,
        clinicName: clinicName || undefined,
        right: parseEye(right),
        left:  parseEye(left),
        pd:    pd ? parseFloat(pd) : undefined,
        notes: notes || undefined,
        imageUrl: pendingImageUrl,
      }),
    })
    const data = await r.json()
    setLoading(false)
    if (!r.ok) { setError(data.error); return }
    router.push('/so-y-ba/dashboard')
  }

  if (checking) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <p className="font-black text-gray-900">Thêm đơn kính</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Tabs chọn cách nhập */}
        <div className="flex bg-white border border-gray-200 rounded-2xl p-1 shadow-sm">
          {([['manual', 'Nhập thủ công'], ['ocr', 'Đọc từ ảnh đơn kính']] as [InputMode, string][]).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${mode === m ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {m === 'ocr' && <span className="mr-1.5">📷</span>}{label}
            </button>
          ))}
        </div>

        {/* OCR section */}
        {mode === 'ocr' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <div>
              <p className="text-sm font-bold text-gray-900 mb-0.5">Chụp ảnh đơn kính</p>
              <p className="text-xs text-gray-400">AI sẽ tự động đọc và điền vào form. Bạn có thể chỉnh lại trước khi lưu.</p>
            </div>
            <OcrUploader onSuccess={handleOcrSuccess}/>
          </div>
        )}

        {/* Banner OCR thành công */}
        {ocrDone && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex items-start gap-3">
            <span className="text-blue-500 text-lg mt-0.5">✓</span>
            <div>
              <p className="text-sm font-bold text-blue-800">Đã điền từ ảnh đơn kính</p>
              <p className="text-xs text-blue-600 mt-0.5">Kiểm tra lại từng số bên dưới — AI có thể đọc nhầm nếu ảnh mờ.</p>
            </div>
          </div>
        )}

        {/* Form nhập liệu */}
        <form id="form-section" onSubmit={handleSubmit} className="space-y-4">

          {/* Thông tin chung */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Thông tin khám</p>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ngày khám</label>
              <input
                type="date" required value={examDate} onChange={e => setExamDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Nơi khám <span className="font-normal text-gray-400">(không bắt buộc)</span>
              </label>
              <input
                type="text" value={clinicName} onChange={e => setClinicName(e.target.value)}
                placeholder="Phòng khám mắt, bệnh viện..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          {/* Hướng dẫn nhanh */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3">
            <p className="text-xs text-amber-700 font-semibold mb-0.5">Cách đọc đơn kính</p>
            <p className="text-[11px] text-amber-600 leading-relaxed">
              <strong>SPH</strong> = Độ cầu (âm: cận, dương: viễn) · <strong>CYL</strong> = Độ trụ (loạn) · <strong>AXIS</strong> = Trục loạn · <strong>ADD</strong> = Thêm cho kính đọc
            </p>
          </div>

          {/* Mắt phải */}
          <EyeSection title="Mắt phải (OD — Oculus Dexter)" color="border-blue-200"  data={right} onChange={setRight}/>

          {/* Mắt trái */}
          <EyeSection title="Mắt trái (OS — Oculus Sinister)"  color="border-rose-200" data={left}  onChange={setLeft}/>

          {/* PD + Ghi chú */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Thông tin thêm</p>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                PD — Khoảng cách đồng tử <span className="font-normal text-gray-400">(không bắt buộc)</span>
              </label>
              <input
                type="number" value={pd} onChange={e => setPd(e.target.value)}
                min={50} max={80} step={0.5} placeholder="60 – 70 mm"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Ghi chú <span className="font-normal text-gray-400">(không bắt buộc)</span>
              </label>
              <textarea
                value={notes} onChange={e => setNotes(e.target.value)}
                rows={2} placeholder="VD: Bác sĩ khuyên đổi kính trong 3 tháng tới..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs bg-red-50 px-4 py-3 rounded-xl border border-red-100">{error}</p>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-blue-500/20"
          >
            {loading ? 'Đang lưu...' : 'Lưu đơn kính'}
          </button>
        </form>
      </div>
    </div>
  )
}
