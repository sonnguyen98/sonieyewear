'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SoYBaPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')

  // Nếu đã đăng nhập → chuyển thẳng vào dashboard
  useEffect(() => {
    fetch('/api/customer/me').then(r => {
      if (r.ok) router.replace('/so-y-ba/dashboard')
      else setChecking(false)
    }).catch(() => setChecking(false))
  }, [router])

  async function handleAccess(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const r = await fetch('/api/customer/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, name: name || undefined }),
    })
    const data = await r.json()
    setLoading(false)
    if (!r.ok) { setError(data.error); return }
    router.push('/so-y-ba/dashboard')
  }

  if (checking) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <a href="/" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">← Trang chủ</a>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-8 max-w-sm">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Sổ Y Bạ Khúc Xạ</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Lưu trữ lịch sử đơn kính, theo dõi độ mắt qua từng năm. Miễn phí cho tất cả mọi người.
          </p>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-gray-200/60 p-6">
          <form onSubmit={handleAccess} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Số điện thoại</label>
              <input
                type="tel" required value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="0912 345 678"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Họ và tên <span className="font-normal text-gray-400">(nếu là lần đầu)</span></label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
            {error && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-60 text-sm"
            >
              {loading ? 'Đang vào...' : 'Vào Sổ Y Bạ'}
            </button>
            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              Chỉ cần số điện thoại — không cần mật khẩu. Lần sau quay lại, nhập đúng số này để xem lại thông tin của bạn.
            </p>
          </form>
        </div>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-3 gap-3 max-w-sm w-full">
          {[
            { icon: '📊', text: 'Biểu đồ độ mắt theo năm' },
            { icon: '🔒', text: 'Bảo mật, riêng tư' },
            { icon: '📱', text: 'Miễn phí mãi mãi' },
          ].map(b => (
            <div key={b.text} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
              <div className="text-xl mb-1">{b.icon}</div>
              <p className="text-[10px] text-gray-500 leading-tight">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
