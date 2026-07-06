'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface Customer { id: string; name?: string; email?: string; phone: string; createdAt: string }
interface EyeData { sph: number; cyl: number; axis: number; add?: number }
interface Prescription {
  id: string; examDate: string; clinicName?: string
  right: EyeData; left: EyeData; pd?: number; notes?: string; createdAt: string
}

const fmtDate = (s: string) => new Date(s + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
const fmtSPH = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(2)
const fmtNum = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(2)

// ── Biểu đồ SPH theo thời gian ──────────────────────────────────────────────
function SPHChart({ prescriptions }: { prescriptions: Prescription[] }) {
  const sorted = [...prescriptions].sort((a, b) => a.examDate.localeCompare(b.examDate))
  if (sorted.length < 2) return (
    <p className="text-gray-400 text-xs text-center py-6">Thêm ít nhất 2 lần đo để xem biểu đồ tiến triển</p>
  )

  const W = 380, H = 180, PL = 44, PR = 16, PT = 16, PB = 36
  const cW = W - PL - PR, cH = H - PT - PB

  const allSPH = sorted.flatMap(p => [p.right.sph, p.left.sph])
  const minV = Math.min(...allSPH)
  const maxV = Math.max(...allSPH)
  const range = maxV - minV || 1
  const padV = range * 0.2

  const xOf = (i: number) => PL + (i / (sorted.length - 1)) * cW
  const yOf = (v: number) => PT + cH - ((v - minV + padV) / (range + padV * 2)) * cH

  const rPts = sorted.map((p, i) => `${xOf(i)},${yOf(p.right.sph)}`).join(' ')
  const lPts = sorted.map((p, i) => `${xOf(i)},${yOf(p.left.sph)}`).join(' ')

  // Y ticks
  const step = range <= 2 ? 0.5 : range <= 5 ? 1 : 2
  const ticks: number[] = []
  for (let v = Math.ceil((minV - padV) / step) * step; v <= maxV + padV; v += step) {
    ticks.push(Math.round(v * 10) / 10)
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-3 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-blue-500 inline-block rounded"/><span className="text-gray-500">Mắt phải</span></span>
        <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-rose-500 inline-block rounded"/><span className="text-gray-500">Mắt trái</span></span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Grid + Y labels */}
        {ticks.map(v => (
          <g key={v}>
            <line x1={PL} y1={yOf(v)} x2={W - PR} y2={yOf(v)} stroke="#f3f4f6" strokeWidth="1"/>
            <text x={PL - 6} y={yOf(v) + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{fmtSPH(v)}</text>
          </g>
        ))}
        {/* Zero line */}
        {minV <= 0 && maxV >= 0 && (
          <line x1={PL} y1={yOf(0)} x2={W - PR} y2={yOf(0)} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 2"/>
        )}
        {/* Lines */}
        <polyline points={rPts} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round"/>
        <polyline points={lPts} fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinejoin="round"/>
        {/* Dots + X labels */}
        {sorted.map((p, i) => (
          <g key={p.id}>
            <circle cx={xOf(i)} cy={yOf(p.right.sph)} r="3.5" fill="#3b82f6"/>
            <circle cx={xOf(i)} cy={yOf(p.left.sph)} r="3.5" fill="#f43f5e"/>
            <text
              x={xOf(i)} y={H - 6} textAnchor="middle" fontSize="8" fill="#9ca3af"
              transform={sorted.length > 4 ? `rotate(-30, ${xOf(i)}, ${H - 6})` : undefined}
            >
              {fmtDate(p.examDate).slice(3)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

// ── Nhận xét xu hướng ───────────────────────────────────────────────────────
function TrendNote({ prescriptions }: { prescriptions: Prescription[] }) {
  const sorted = [...prescriptions].sort((a, b) => a.examDate.localeCompare(b.examDate))
  if (sorted.length < 2) return null

  const first = sorted[0], last = sorted[sorted.length - 1]
  const rChange = last.right.sph - first.right.sph
  const lChange = last.left.sph - first.left.sph
  const avgChange = (rChange + lChange) / 2

  let note = '', color = ''
  if (Math.abs(avgChange) <= 0.25) {
    note = 'Mắt bạn đang ổn định'; color = 'text-green-600 bg-green-50 border-green-200'
  } else if (avgChange < 0) {
    note = `Độ cận tăng thêm ${Math.abs(avgChange).toFixed(2)} độ kể từ lần đo đầu`
    color = 'text-amber-700 bg-amber-50 border-amber-200'
  } else {
    note = `Độ mắt giảm ${avgChange.toFixed(2)} độ kể từ lần đo đầu`
    color = 'text-blue-700 bg-blue-50 border-blue-200'
  }

  return (
    <p className={`text-xs font-medium px-3 py-2 rounded-xl border ${color}`}>{note}</p>
  )
}

// ── Card đơn kính ─────────────────────────────────────────────────────────────
function PrescriptionCard({ rx, onDelete }: { rx: Prescription; onDelete: (id: string) => void }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function doDelete() {
    setDeleting(true)
    await fetch(`/api/prescription/${rx.id}`, { method: 'DELETE' })
    onDelete(rx.id)
  }

  const EyeBlock = ({ label, eye }: { label: string; eye: EyeData }) => (
    <div>
      <p className="text-[10px] font-bold text-gray-400 mb-1.5">{label}</p>
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { k: 'SPH', v: fmtNum(eye.sph) },
          { k: 'CYL', v: fmtNum(eye.cyl) },
          { k: 'AXIS', v: eye.axis + '°' },
        ].map(({ k, v }) => (
          <div key={k} className="bg-gray-50 rounded-lg px-2 py-1.5 text-center">
            <p className="text-[9px] text-gray-400 font-semibold">{k}</p>
            <p className="text-xs font-bold text-gray-800 font-mono">{v}</p>
          </div>
        ))}
        {eye.add !== undefined && (
          <div className="col-span-3 bg-blue-50 rounded-lg px-2 py-1.5 text-center">
            <p className="text-[9px] text-blue-400 font-semibold">ADD (cộng thêm)</p>
            <p className="text-xs font-bold text-blue-700 font-mono">{fmtNum(eye.add)}</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-gray-900 text-sm">{fmtDate(rx.examDate)}</p>
          {rx.clinicName && <p className="text-xs text-gray-400 mt-0.5">{rx.clinicName}</p>}
        </div>
        {!confirming ? (
          <button onClick={() => setConfirming(true)} className="text-gray-300 hover:text-red-400 transition-colors p-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setConfirming(false)} className="text-xs text-gray-500 hover:text-gray-700">Hủy</button>
            <button onClick={doDelete} disabled={deleting} className="text-xs text-red-500 font-semibold hover:text-red-700">
              {deleting ? 'Đang xóa...' : 'Xóa'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <EyeBlock label="MẮT PHẢI (OD)" eye={rx.right} />
        <EyeBlock label="MẮT TRÁI (OS)" eye={rx.left} />
      </div>

      {(rx.pd || rx.notes) && (
        <div className="mt-3 pt-3 border-t border-gray-50 space-y-1">
          {rx.pd && <p className="text-xs text-gray-500">Khoảng cách đồng tử (PD): <span className="font-semibold text-gray-700">{rx.pd} mm</span></p>}
          {rx.notes && <p className="text-xs text-gray-400 italic">{rx.notes}</p>}
        </div>
      )}
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [meRes, rxRes] = await Promise.all([
      fetch('/api/customer/me'),
      fetch('/api/prescription'),
    ])
    if (!meRes.ok) { router.replace('/so-y-ba'); return }
    const { customer } = await meRes.json()
    setCustomer(customer)
    if (rxRes.ok) {
      const { prescriptions } = await rxRes.json()
      setPrescriptions(prescriptions)
    }
    setLoading(false)
  }, [router])

  useEffect(() => { load() }, [load])

  async function handleLogout() {
    await fetch('/api/customer/logout', { method: 'POST' })
    router.push('/so-y-ba')
  }

  function handleDelete(id: string) {
    setPrescriptions(prev => prev.filter(p => p.id !== id))
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
        <p className="text-gray-400 text-sm">Đang tải...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="font-black text-gray-900">Sổ Theo Dõi Độ Khúc Xạ</p>
            <p className="text-xs text-gray-400">Xin chào, {customer?.name || customer?.phone}</p>
          </div>
          <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Đăng xuất</button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Nút thêm đơn */}
        <button
          onClick={() => router.push('/so-y-ba/them-don')}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
          </svg>
          Thêm đơn kính mới
        </button>

        {prescriptions.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-3xl border border-gray-100 p-10 text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <p className="font-bold text-gray-700 mb-1">Chưa có đơn kính nào</p>
            <p className="text-sm text-gray-400">Thêm đơn kính đầu tiên để bắt đầu theo dõi lịch sử thị lực của bạn.</p>
          </div>
        ) : (
          <>
            {/* Biểu đồ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-gray-900">Biểu đồ độ SPH</p>
                <p className="text-xs text-gray-400">{prescriptions.length} lần đo</p>
              </div>
              <TrendNote prescriptions={prescriptions} />
              <div className="mt-3">
                <SPHChart prescriptions={prescriptions} />
              </div>
            </div>

            {/* Danh sách */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Lịch sử đơn kính</p>
              <div className="space-y-3">
                {prescriptions.map(rx => (
                  <PrescriptionCard key={rx.id} rx={rx} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
