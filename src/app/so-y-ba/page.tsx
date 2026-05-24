'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'login' | 'register'

export default function SoYBaPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('login')
  const [checking, setChecking] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state — login
  const [loginPhone, setLoginPhone] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Form state — register
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regDob, setRegDob] = useState('')

  // Nếu đã đăng nhập → chuyển thẳng vào dashboard
  useEffect(() => {
    fetch('/api/customer/me').then(r => {
      if (r.ok) router.replace('/so-y-ba/dashboard')
      else setChecking(false)
    }).catch(() => setChecking(false))
  }, [router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const r = await fetch('/api/customer/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: loginPhone, password: loginPassword }),
    })
    const data = await r.json()
    setLoading(false)
    if (!r.ok) { setError(data.error); return }
    router.push('/so-y-ba/dashboard')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const r = await fetch('/api/customer/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: regName, email: regEmail, phone: regPhone, password: regPassword, dob: regDob || undefined }),
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
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            {(['login', 'register'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {t === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            ))}
          </div>

          {/* Login form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Số điện thoại</label>
                <input
                  type="tel" required value={loginPhone} onChange={e => setLoginPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mật khẩu</label>
                <input
                  type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
              {error && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <button
                type="submit" disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-60 text-sm"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>
          )}

          {/* Register form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Họ và tên</label>
                <input
                  type="text" required value={regName} onChange={e => setRegName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                <input
                  type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Số điện thoại</label>
                <input
                  type="tel" required value={regPhone} onChange={e => setRegPhone(e.target.value)}
                  placeholder="0912 345 678"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mật khẩu</label>
                <input
                  type="password" required minLength={6} value={regPassword} onChange={e => setRegPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ngày sinh <span className="font-normal text-gray-400">(không bắt buộc)</span></label>
                <input
                  type="date" value={regDob} onChange={e => setRegDob(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
              {error && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <button
                type="submit" disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-60 text-sm"
              >
                {loading ? 'Đang đăng ký...' : 'Tạo tài khoản miễn phí'}
              </button>
              <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                Bằng cách đăng ký, bạn đồng ý cho SONi Kính lưu trữ thông tin thị lực để phục vụ tốt hơn.
              </p>
            </form>
          )}
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
