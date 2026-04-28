'use client'

import { useState, useEffect, useCallback } from 'react'

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ'
const fmtDate = (s: string) => new Date(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

interface Affiliate {
  id: string; code: string; name: string; phone: string
  bankName: string; bankAccount: string; bankOwner: string
  balance: number; pendingBalance: number; totalEarned: number; totalWithdrawn: number
  createdAt: string; status: string
}
interface Commission {
  id: string; orderCode: string; customerName: string
  orderAmount: number; commission: number; paymentType: string
  status: 'approved' | 'pending'; createdAt: string
}
interface Withdrawal {
  id: string; amount: number; status: 'pending' | 'paid'
  requestedAt: string; paidAt?: string; bankName: string; bankAccount: string
}

type Screen = 'landing' | 'register' | 'login' | 'dashboard'

const HOST = typeof window !== 'undefined' ? window.location.origin : 'https://kinhmatsoni.com'

export default function AffiliatePage() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [auth, setAuth] = useState<{ code: string; phone: string } | null>(null)
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null)
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [copied, setCopied] = useState(false)

  // Khôi phục session từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem('affiliateAuth')
    if (saved) {
      const a = JSON.parse(saved)
      setAuth(a)
      setScreen('dashboard')
    }
  }, [])

  const loadDashboard = useCallback(async (a: { code: string; phone: string }) => {
    setLoading(true)
    const r = await fetch('/api/affiliate/dashboard', { headers: { 'x-affiliate-code': a.code, 'x-affiliate-phone': a.phone } })
    if (r.ok) {
      const d = await r.json()
      setAffiliate(d.affiliate)
      setCommissions(d.commissions)
      setWithdrawals(d.withdrawals)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (auth && screen === 'dashboard') loadDashboard(auth)
  }, [auth, screen, loadDashboard])

  function logout() {
    localStorage.removeItem('affiliateAuth')
    setAuth(null); setAffiliate(null); setScreen('landing')
  }

  function copyLink() {
    if (!affiliate) return
    navigator.clipboard.writeText(`${HOST}/?ref=${affiliate.code}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  // ── Landing ──────────────────────────────────────────────────────────────────
  if (screen === 'landing') return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-xs font-bold px-4 py-2 rounded-full mb-6 border border-amber-500/30">
          💰 Chương Trình Kiếm Tiền Cùng SONi
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
          Chia sẻ link —<br/><span className="text-amber-400">Nhận 10% hoa hồng</span>
        </h1>
        <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
          Giới thiệu khách hàng mua kính tại SONi, bạn nhận ngay 10% giá trị đơn hàng. Không cần vốn, không giới hạn thu nhập.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <button onClick={() => setScreen('register')}
            className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-gray-900 font-black rounded-2xl transition-all shadow-lg shadow-amber-500/30 active:scale-95">
            Đăng ký ngay — Miễn phí
          </button>
          <button onClick={() => setScreen('login')}
            className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl transition-all border border-white/20">
            Đã có tài khoản →
          </button>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: '🔗', title: 'Lấy link riêng', desc: 'Nhận link giới thiệu cá nhân hoá sau khi đăng ký' },
            { icon: '📢', title: 'Chia sẻ bất kỳ đâu', desc: 'Facebook, Zalo, TikTok, nhóm chat — không giới hạn' },
            { icon: '💸', title: 'Nhận hoa hồng', desc: '10% mỗi đơn thành công — rút về ngân hàng khi đủ 100.000đ' },
          ].map(s => (
            <div key={s.title} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
              <div className="text-3xl mb-3">{s.icon}</div>
              <p className="font-bold text-white mb-1">{s.title}</p>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Commission rules */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left max-w-2xl mx-auto">
          <p className="font-bold text-white mb-4 text-center">📋 Quy tắc hoa hồng</p>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</span>
              <div><p className="text-white font-semibold">Đơn có cọc / thanh toán trước</p><p className="text-gray-400">Hoa hồng cộng ngay vào tài khoản — rút được luôn</p></div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">⏳</span>
              <div><p className="text-white font-semibold">Đơn COD (ship hàng — thu tiền khi giao)</p><p className="text-gray-400">Hoa hồng chờ duyệt — tự động duyệt khi xác nhận giao hàng thành công</p></div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">🏦</span>
              <div><p className="text-white font-semibold">Rút tiền</p><p className="text-gray-400">Tối thiểu 100.000đ — SONi chuyển khoản ngân hàng trong 24h</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Register ──────────────────────────────────────────────────────────────────
  if (screen === 'register') return <AuthForm mode="register" onBack={() => setScreen('landing')}
    onSuccess={(code, phone) => {
      const a = { code, phone }
      localStorage.setItem('affiliateAuth', JSON.stringify(a))
      setAuth(a); setScreen('dashboard')
    }} />

  // ── Login ─────────────────────────────────────────────────────────────────────
  if (screen === 'login') return <AuthForm mode="login" onBack={() => setScreen('landing')}
    onSuccess={(code, phone) => {
      const a = { code, phone }
      localStorage.setItem('affiliateAuth', JSON.stringify(a))
      setAuth(a); setScreen('dashboard')
    }} />

  // ── Dashboard ─────────────────────────────────────────────────────────────────
  if (!affiliate || loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/><p className="text-gray-500 text-sm">Đang tải...</p></div>
    </div>
  )

  const refLink = `${HOST}/?ref=${affiliate.code}`
  const canWithdraw = affiliate.balance >= 100000

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="font-black text-lg">SONi Affiliate</p>
            <p className="text-xs text-gray-400">Xin chào, {affiliate.name} · {affiliate.code}</p>
          </div>
          <button onClick={logout} className="text-xs text-gray-400 hover:text-white transition-colors">Đăng xuất</button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* Link chia sẻ */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white">
          <p className="text-xs font-bold opacity-80 mb-1">LINK GIỚI THIỆU CỦA BẠN</p>
          <p className="font-mono text-sm bg-black/20 rounded-xl px-3 py-2 mb-3 break-all">{refLink}</p>
          <button onClick={copyLink}
            className="w-full py-2.5 bg-white text-amber-700 font-bold rounded-xl text-sm transition-all active:scale-95">
            {copied ? '✓ Đã copy!' : '📋 Copy Link'}
          </button>
        </div>

        {/* Số dư */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Số dư rút được', value: affiliate.balance, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Chờ duyệt', value: affiliate.pendingBalance, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Tổng đã kiếm', value: affiliate.totalEarned, color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center`}>
              <p className={`text-lg font-black ${s.color}`}>{fmt(s.value)}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Rút tiền */}
        <WithdrawPanel affiliate={affiliate} canWithdraw={canWithdraw} auth={auth!}
          onSuccess={() => { loadDashboard(auth!); setMsg('✅ Yêu cầu rút tiền đã gửi! SONi sẽ chuyển khoản trong 24h.') }} />

        {msg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">{msg}</div>}

        {/* Lịch sử hoa hồng */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="font-bold text-sm text-gray-900">Lịch sử hoa hồng</p>
            <span className="text-xs text-gray-400">{commissions.length} đơn</span>
          </div>
          {commissions.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm">Chưa có đơn hàng nào qua link của bạn</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {commissions.map(c => (
                <div key={c.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900">{c.orderCode}</p>
                    <p className="text-[10px] text-gray-400">{fmtDate(c.createdAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-gray-900">+{fmt(c.commission)}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${c.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {c.status === 'approved' ? '✓ Đã duyệt' : '⏳ Chờ duyệt'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lịch sử rút tiền */}
        {withdrawals.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="font-bold text-sm text-gray-900">Lịch sử rút tiền</p>
            </div>
            <div className="divide-y divide-gray-50">
              {withdrawals.map(w => (
                <div key={w.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900">{fmt(w.amount)}</p>
                    <p className="text-[10px] text-gray-400">{w.bankName} · {w.bankAccount}</p>
                    <p className="text-[10px] text-gray-400">{fmtDate(w.requestedAt)}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${w.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {w.status === 'paid' ? '✓ Đã nhận' : '⏳ Đang xử lý'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Auth Form ─────────────────────────────────────────────────────────────────
function AuthForm({ mode, onBack, onSuccess }: { mode: 'register' | 'login'; onBack: () => void; onSuccess: (code: string, phone: string) => void }) {
  const [form, setForm] = useState({ name: '', phone: '', password: '', bankName: '', bankAccount: '', bankOwner: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }))

  async function handleSubmit() {
    setLoading(true); setError('')
    const url = mode === 'register' ? '/api/affiliate/register' : '/api/affiliate/login'
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const d = await r.json()
    setLoading(false)
    if (!r.ok) { setError(d.error ?? 'Có lỗi xảy ra'); return }
    onSuccess(d.affiliate.code, form.phone)
  }

  const inp = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-900 transition-colors'

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
        <button onClick={onBack} className="text-xs text-gray-400 hover:text-gray-700 mb-4">← Quay lại</button>
        <h2 className="text-xl font-black text-gray-900 mb-1">{mode === 'register' ? 'Đăng ký Affiliate' : 'Đăng nhập'}</h2>
        <p className="text-xs text-gray-400 mb-5">{mode === 'register' ? 'Tạo tài khoản để nhận link và theo dõi hoa hồng' : 'Đăng nhập để xem tài khoản của bạn'}</p>

        <div className="space-y-3">
          {mode === 'register' && <input placeholder="Họ và tên *" value={form.name} onChange={f('name')} className={inp} />}
          <input placeholder="Số điện thoại *" value={form.phone} onChange={f('phone')} className={inp} type="tel" />
          <input placeholder="Mật khẩu *" value={form.password} onChange={f('password')} className={inp} type="password" />

          {mode === 'register' && (
            <>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-semibold text-gray-500 mb-2">Thông tin ngân hàng (để nhận tiền)</p>
                <div className="space-y-2">
                  <input placeholder="Tên ngân hàng (VD: MB Bank, Vietcombank...)" value={form.bankName} onChange={f('bankName')} className={inp} />
                  <input placeholder="Số tài khoản *" value={form.bankAccount} onChange={f('bankAccount')} className={inp} />
                  <input placeholder="Tên chủ tài khoản *" value={form.bankOwner} onChange={f('bankOwner')} className={inp} />
                </div>
              </div>
            </>
          )}
        </div>

        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}

        <button onClick={handleSubmit} disabled={loading}
          className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-400 text-gray-900 font-black rounded-2xl transition-all disabled:opacity-50 active:scale-95">
          {loading ? 'Đang xử lý...' : mode === 'register' ? 'Đăng ký ngay' : 'Đăng nhập'}
        </button>

        {mode === 'register' && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Đã có tài khoản?{' '}
            <button onClick={() => { setError(''); onBack(); setTimeout(() => document.dispatchEvent(new CustomEvent('showLogin')), 0) }}
              className="text-amber-600 font-semibold hover:underline">Đăng nhập</button>
          </p>
        )}
      </div>
    </div>
  )
}

// ── Withdraw Panel ─────────────────────────────────────────────────────────────
function WithdrawPanel({ affiliate, canWithdraw, auth, onSuccess }: { affiliate: Affiliate; canWithdraw: boolean; auth: { code: string; phone: string }; onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  async function handleWithdraw() {
    setLoading(true); setError('')
    const r = await fetch('/api/affiliate/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-affiliate-code': auth.code, 'x-affiliate-phone': auth.phone },
      body: JSON.stringify({ amount: Number(amount) || affiliate.balance }),
    })
    const d = await r.json()
    setLoading(false)
    if (!r.ok) { setError(d.error); return }
    setOpen(false); onSuccess()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-sm text-gray-900">Rút tiền về ngân hàng</p>
          <p className="text-xs text-gray-400 mt-0.5">{affiliate.bankName} · {affiliate.bankAccount} · {affiliate.bankOwner}</p>
        </div>
        <button onClick={() => setOpen(!open)} disabled={!canWithdraw}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${canWithdraw ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
          {canWithdraw ? 'Rút tiền' : `Cần thêm ${new Intl.NumberFormat('vi-VN').format(100000 - affiliate.balance)}đ`}
        </button>
      </div>
      {open && (
        <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
          <input type="number" placeholder={`Số tiền muốn rút (tối đa ${new Intl.NumberFormat('vi-VN').format(affiliate.balance)}đ)`}
            value={amount} onChange={e => setAmount(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-900" />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button onClick={() => setOpen(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-semibold">Huỷ</button>
            <button onClick={handleWithdraw} disabled={loading}
              className="flex-1 py-2 bg-green-500 text-white rounded-xl text-xs font-bold disabled:opacity-50">
              {loading ? 'Đang xử lý...' : 'Xác nhận rút'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
