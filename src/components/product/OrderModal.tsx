'use client'

import { useState, useEffect } from 'react'
import { invalidateStockCache } from '@/hooks/useStock'
import Image from 'next/image'
import type { Product } from '@/types/product'
import { formatVND } from '@/lib/utils'

interface OrderModalProps {
  product: Product
  onClose: () => void
}

type Step = 'main' | 'don-trong' | 'don-trong-detail' | 'da-trong' | 'checkout' | 'success'

interface LensOption {
  id: string
  name: string
  desc: string
  price: number
  icon: string
  badge?: string
  features: string[]
}

interface LensVariant {
  id: string
  name: string
  price: number
  badge?: string
  features: string[]
  suitableFor: string
  recommended?: boolean
}

interface LensCategoryGroup {
  id: string
  name: string
  icon: string
  desc: string
  badge?: string
  variants: LensVariant[]
}

interface EyeRx {
  sph: string
  cyl: string
  axis: string
}

interface CheckoutForm {
  name: string
  phone: string
  address: string
  note: string
  payment: string
  rxMode: 'form' | 'image'
  rxRight: EyeRx
  rxLeft: EyeRx
  rxAdd: string
  rxImageBase64: string
  rxImageName: string
}

const DON_TRONG_CATEGORIES: LensCategoryGroup[] = [
  {
    id: 'trang',
    name: 'Tròng Trắng',
    icon: '⬜',
    desc: 'Tròng trong suốt, chống UV400 — lựa chọn phổ thông',
    variants: [
      { id: 'trang-156', name: 'CR-39 1.56 Tiêu Chuẩn', price: 300000, badge: 'Tiết kiệm', features: ['Chống UV400', 'Phủ chống trầy', 'Chỉ số 1.56'], suitableFor: '0 – 4 độ' },
      { id: 'trang-160', name: 'Hi-Index 1.60', price: 450000, features: ['Chống UV400', 'Mỏng hơn 15%', 'Phủ chống trầy'], suitableFor: '4 – 8 độ', recommended: true },
    ],
  },
  {
    id: 'blue',
    name: 'Chống Ánh Sáng Xanh',
    icon: '🔵',
    desc: 'Lọc HEV Blue Light, giảm mỏi mắt khi dùng màn hình',
    badge: 'Phổ biến',
    variants: [
      { id: 'blue-156', name: 'CR-39 1.56', price: 550000, badge: 'Phổ biến', features: ['Lọc HEV Blue Light', 'Chống UV400', 'Giảm mỏi mắt'], suitableFor: '0 – 4 độ', recommended: true },
      { id: 'blue-160', name: 'Hi-Index 1.60', price: 750000, features: ['Lọc HEV Blue Light', 'Mỏng hơn 15%', 'Chống UV400'], suitableFor: '4 – 8 độ' },
      { id: 'blue-167', name: '1.67 Siêu Mỏng', price: 950000, badge: 'Mỏng nhất', features: ['Lọc HEV Blue Light', 'Siêu mỏng nhẹ', 'Chống UV400', 'Phủ AR'], suitableFor: 'Trên 6 độ' },
    ],
  },
  {
    id: 'doi-mau',
    name: 'Tự Đổi Màu',
    icon: '🌗',
    desc: 'Trong nhà trong suốt, tự tối khi ra nắng trong 30 giây',
    badge: 'Độc đáo',
    variants: [
      { id: 'doi-mau-156', name: 'CR-39 1.56', price: 850000, features: ['Đổi màu tự động', 'Chống UV400', 'Bảo vệ 100% tia UV'], suitableFor: '0 – 4 độ', recommended: true },
      { id: 'doi-mau-160', name: 'Hi-Index 1.60', price: 1100000, features: ['Đổi màu tự động', 'Mỏng hơn', 'Chống UV400'], suitableFor: '4 – 8 độ' },
    ],
  },
  {
    id: 'phan-cuc',
    name: 'Tròng Phân Cực',
    icon: '🕶️',
    desc: 'Chống chói tối ưu khi lái xe và hoạt động ngoài trời',
    variants: [
      { id: 'phan-cuc-std', name: 'Polarized Tiêu Chuẩn', price: 650000, features: ['Chống chói 100%', 'Tăng độ tương phản', 'Chống UV400'], suitableFor: 'Kính râm / lái xe', recommended: true },
    ],
  },
  {
    id: 'mong',
    name: 'Tròng Mỏng Hi-Index',
    icon: '💎',
    desc: 'Siêu mỏng nhẹ, thẩm mỹ cao — dành cho độ cận lớn',
    variants: [
      { id: 'mong-167', name: '1.67 Mỏng', price: 750000, features: ['Chỉ số 1.67', 'Mỏng hơn 30%', 'Chống UV400'], suitableFor: '4 – 8 độ', recommended: true },
      { id: 'mong-174', name: '1.74 Siêu Mỏng', price: 1100000, badge: 'Mỏng nhất', features: ['Chỉ số 1.74', 'Mỏng nhất hiện nay', 'Chống UV400', 'Phủ AR'], suitableFor: 'Trên 8 độ' },
    ],
  },
]

const DA_TRONG: LensOption[] = [
  {
    id: 'da-trong-cb',
    name: 'Đa Tròng Cơ Bản',
    desc: 'Nhìn gần, trung, xa trong cùng một tròng',
    price: 1500000,
    icon: '👁️',
    features: ['3 vùng nhìn', 'Không đường phân cách', 'Cần thích nghi 1–2 tuần'],
  },
  {
    id: 'da-trong-blue',
    name: 'Đa Tròng Chống Sáng Xanh',
    desc: 'Đa tròng tích hợp lọc ánh sáng xanh',
    price: 1800000,
    icon: '🔵',
    badge: 'Đề xuất',
    features: ['3 vùng nhìn', 'Lọc HEV Blue Light', 'Chống UV400'],
  },
  {
    id: 'da-trong-mong',
    name: 'Đa Tròng Mỏng Cao Cấp',
    desc: 'Siêu mỏng, thẩm mỹ cao, cho độ lớn',
    price: 2200000,
    icon: '💎',
    features: ['Chỉ số 1.67', 'Siêu mỏng', 'Chống UV400', 'Phủ AR'],
  },
]

const DISCOUNT = 0.20

const DON_GROUP_ORDER = ['trang', 'blue', 'mong', 'doi-mau', 'phan-cuc']

const GROUP_META: Record<string, { name: string; icon: string; desc: string; badge?: string }> = {
  trang:    { name: 'Tròng Trắng',           icon: '⬜', desc: 'Tròng trong suốt, chống UV400 — lựa chọn phổ thông' },
  blue:     { name: 'Chống Ánh Sáng Xanh',   icon: '🔵', desc: 'Lọc HEV Blue Light, giảm mỏi mắt khi dùng màn hình', badge: 'Phổ biến' },
  mong:     { name: 'Tròng Mỏng Hi-Index',    icon: '💎', desc: 'Siêu mỏng nhẹ, thẩm mỹ cao — dành cho độ cận lớn' },
  'doi-mau':  { name: 'Tự Đổi Màu',          icon: '🌗', desc: 'Trong nhà trong suốt, tự tối khi ra nắng trong 30 giây', badge: 'Độc đáo' },
  'phan-cuc': { name: 'Tròng Phân Cực',       icon: '🕶️', desc: 'Chống chói tối ưu khi lái xe và hoạt động ngoài trời' },
  'da-cb':    { name: 'Đa Tròng Cơ Bản',      icon: '👁️', desc: 'Nhìn gần, trung, xa trong cùng một tròng' },
  'da-blue':  { name: 'Đa Tròng Chống Ánh Xanh', icon: '🔵', desc: 'Đa tròng tích hợp lọc ánh sáng xanh', badge: 'Đề xuất' },
  'da-mong':  { name: 'Đa Tròng Mỏng Cao Cấp',   icon: '💎', desc: 'Siêu mỏng, thẩm mỹ cao, cho độ lớn' },
}

const PAYMENT_METHODS = [
  {
    id: 'cod' as const,
    label: 'Thanh toán khi nhận hàng (COD)',
    sub: 'Kiểm tra hàng trước, trả tiền sau',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    badge: 'Phổ biến nhất',
    color: 'text-green-600 bg-green-50 border-green-200',
  },
  {
    id: 'bank' as const,
    label: 'Chuyển khoản ngân hàng',
    sub: 'Chuyển khoản — xác nhận trong 5 phút',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    id: 'momo' as const,
    label: 'Ví MoMo',
    sub: 'Quét QR — thanh toán trong 30 giây',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <circle cx="17.5" cy="17.5" r="2"/>
      </svg>
    ),
    color: 'text-pink-600 bg-pink-50 border-pink-200',
  },
]

function PaymentStep({ form, orderCode, discountedTotal, totalPrice, selectedLens, product, paymentConfirmed, onConfirmed, onClose }: {
  form: CheckoutForm
  orderCode: string
  discountedTotal: number
  totalPrice: number
  selectedLens: LensOption | null
  product: Product
  paymentConfirmed: boolean
  onConfirmed: () => void
  onClose: () => void
}) {
  const isCOD = form.payment === 'cod'
  const isDeposit = form.payment.startsWith('deposit')
  const isMomo = form.payment.endsWith('momo')
  const payAmount = isDeposit
    ? Math.round((selectedLens?.price ?? 0) * (1 - DISCOUNT) * 0.5)
    : discountedTotal

  const BANK = process.env.NEXT_PUBLIC_BANK_ID ?? 'MB'
  const ACCOUNT = process.env.NEXT_PUBLIC_BANK_ACCOUNT ?? '1533410071998'
  const ACC_NAME = process.env.NEXT_PUBLIC_BANK_NAME ?? 'Nguy%E1%BB%85n%20V%C4%83n%20S%C6%A1n'
  const MOMO = process.env.NEXT_PUBLIC_MOMO_PHONE ?? '0363978798'

  const transferContent = orderCode
  const accName = 'Nguyen Van Son'
  // Dùng proxy API để tránh CORS trên desktop
  const vietQrUrl = `/api/qr-proxy?bank=${BANK}&account=${ACCOUNT}&amount=${payAmount}&content=${transferContent}&name=${encodeURIComponent(accName)}`
  const momoDeeplink = `momo://app?action=transfer&phone=${MOMO}&amount=${payAmount}&comment=${transferContent}`
  const momoQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(momoDeeplink)}`

  // Poll trạng thái thanh toán mỗi 3 giây
  const [polling, setPolling] = useState(!isCOD && !paymentConfirmed)
  const [pollCount, setPollCount] = useState(0)

  useEffect(() => {
    if (isCOD || paymentConfirmed || !orderCode) return
    const interval = setInterval(async () => {
      setPollCount(c => c + 1)
      try {
        const r = await fetch(`/api/payment-status/${orderCode}`)
        const data = await r.json()
        if (data.paid) {
          setPolling(false)
          onConfirmed()
          clearInterval(interval)
        }
      } catch {}
    }, 3000)
    return () => clearInterval(interval)
  }, [orderCode, isCOD, paymentConfirmed])

  if (paymentConfirmed || isCOD) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${paymentConfirmed ? 'bg-green-100' : 'bg-blue-100'}`}>
          {paymentConfirmed ? (
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-xl font-black text-brand-black">
            {paymentConfirmed ? '✅ Thanh Toán Thành Công!' : '🎉 Đặt Hàng Thành Công!'}
          </p>
          <p className="text-sm text-brand-muted mt-1">Mã đơn: <strong className="text-brand-black">{orderCode}</strong></p>
        </div>
        <div className="bg-brand-light rounded-2xl p-4 text-left space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-brand-muted">Sản phẩm</span><span className="font-semibold line-clamp-1 max-w-[55%] text-right">{product.name}</span></div>
          {selectedLens && <div className="flex justify-between"><span className="text-brand-muted">Tròng kính</span><span className="font-semibold">{selectedLens.name}</span></div>}
          <div className="flex justify-between"><span className="text-brand-muted">Họ tên</span><span className="font-semibold">{form.name}</span></div>
          <div className="flex justify-between"><span className="text-brand-muted">SĐT</span><span className="font-semibold">{form.phone}</span></div>
          <div className="flex justify-between border-t border-brand-border pt-2">
            <span className="font-bold">Tổng thanh toán</span>
            <div className="text-right">
              <span className="font-black text-red-600">{formatVND(discountedTotal)}</span>
              <span className="text-xs text-gray-400 line-through ml-1">{formatVND(totalPrice)}</span>
            </div>
          </div>
        </div>
        {isCOD && (
          <div className="bg-blue-50 rounded-2xl p-4 text-sm text-blue-700 border border-blue-100">
            📞 Nhân viên SONi Kính sẽ gọi xác nhận đơn trong vòng <strong>30 phút</strong>.
          </div>
        )}
        <button onClick={onClose} className="w-full bg-brand-black text-white font-bold py-3.5 rounded-2xl hover:bg-gray-800 transition-colors">
          Đóng
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 py-2">
      {/* Tiêu đề */}
      <div className="text-center">
        <p className="font-black text-lg text-brand-black">Quét mã để thanh toán</p>
        <p className="text-xs text-brand-muted mt-0.5">Mã đơn: <strong className="text-brand-black">{orderCode}</strong></p>
      </div>

      {/* QR Code */}
      <div className="flex flex-col items-center gap-3">
        <div className="bg-white border-2 border-brand-border rounded-2xl p-3 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={isMomo ? momoQrUrl : vietQrUrl}
            alt="QR thanh toán"
            className="w-56 h-56 object-contain rounded-xl"
          />
        </div>

        {/* Thông tin chuyển khoản */}
        <div className={`w-full rounded-2xl p-4 space-y-2 text-sm ${isMomo ? 'bg-pink-50 border border-pink-200' : 'bg-blue-50 border border-blue-200'}`}>
          {isMomo ? (
            <>
              <p className="font-bold text-pink-700 flex items-center gap-1">📱 Ví MoMo</p>
              <div className="flex justify-between"><span className="text-pink-600">Số điện thoại</span><span className="font-bold text-brand-black">{MOMO}</span></div>
              <div className="flex justify-between"><span className="text-pink-600">Tên</span><span className="font-bold text-brand-black">Nguyễn Văn Sơn</span></div>
            </>
          ) : (
            <>
              <p className="font-bold text-blue-700 flex items-center gap-1">🏦 MB Bank</p>
              <div className="flex justify-between"><span className="text-blue-600">Số tài khoản</span><span className="font-bold text-brand-black">{ACCOUNT}</span></div>
              <div className="flex justify-between"><span className="text-blue-600">Chủ tài khoản</span><span className="font-bold text-brand-black">Nguyễn Văn Sơn</span></div>
            </>
          )}
          <div className="flex justify-between border-t border-current/20 pt-2">
            <span className={isMomo ? 'text-pink-600' : 'text-blue-600'}>Số tiền</span>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-red-600 text-base">{formatVND(payAmount)}</span>
              <button onClick={() => { navigator.clipboard.writeText(String(payAmount)); alert('Đã copy số tiền!') }}
                className="text-[10px] bg-gray-100 hover:bg-gray-200 px-1.5 py-0.5 rounded transition-colors">
                📋
              </button>
            </div>
          </div>
          <div className="flex justify-between">
            <span className={isMomo ? 'text-pink-600' : 'text-blue-600'}>Nội dung CK</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-brand-black bg-yellow-100 px-2 py-0.5 rounded">{transferContent}</span>
              <button onClick={() => { navigator.clipboard.writeText(transferContent); alert('Đã copy nội dung!') }}
                className="text-[10px] bg-gray-100 hover:bg-gray-200 px-1.5 py-0.5 rounded transition-colors">
                📋
              </button>
            </div>
          </div>
          {!isMomo && (
            <div className="flex justify-between">
              <span className="text-blue-600">Số TK</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-brand-black">{ACCOUNT}</span>
                <button onClick={() => { navigator.clipboard.writeText(ACCOUNT); alert('Đã copy số tài khoản!') }}
                  className="text-[10px] bg-gray-100 hover:bg-gray-200 px-1.5 py-0.5 rounded transition-colors">
                  📋
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Copy tất cả + Chuyển khoản nhanh */}
      {!isMomo && (
        <div className="space-y-2">
          {/* Copy tất cả */}
          <button
            onClick={() => {
              const text = `MB Bank\nSTK: ${ACCOUNT}\nChủ TK: ${accName}\nSố tiền: ${formatVND(payAmount)}\nNội dung: ${transferContent}`
              navigator.clipboard.writeText(text)
              alert('Đã copy toàn bộ thông tin chuyển khoản!')
            }}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 rounded-xl transition-colors text-sm border border-gray-200"
          >
            📋 Copy Toàn Bộ Thông Tin CK
          </button>

          <p className="text-center text-[11px] text-brand-muted">
            Quét mã QR hoặc dùng nút Copy để chuyển khoản
          </p>
        </div>
      )}

      {/* Trạng thái chờ */}
      <div className="flex items-center justify-center gap-2 py-1">
        <div className="w-2 h-2 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-brand-gold rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        <span className="text-xs text-brand-muted ml-1">Đang chờ xác nhận thanh toán...</span>
      </div>

      <p className="text-center text-[11px] text-brand-muted">
        ⚡ Hệ thống tự động xác nhận sau khi nhận được tiền
      </p>
    </div>
  )
}

function LensIcon({ icon }: { icon: string }) {
  return (
    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0 border border-gray-200">
      {icon}
    </div>
  )
}

export default function OrderModal({ product, onClose }: OrderModalProps) {
  const [step, setStep] = useState<Step>('main')
  const [selectedLens, setSelectedLens] = useState<LensOption | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<LensCategoryGroup | null>(null)
  const [donTrongCats, setDonTrongCats] = useState<LensCategoryGroup[]>(DON_TRONG_CATEGORIES)
  const [daTrong, setDaTrong] = useState<LensOption[]>(DA_TRONG)
  const emptyEye: EyeRx = { sph: '', cyl: '', axis: '' }

  useEffect(() => {
    fetch('/api/lens-products')
      .then(r => r.json())
      .then((items: { id: string; name: string; desc: string; price: number; badge: string; features: string[]; category?: string; categoryGroup?: string; suitableFor?: string; recommended?: boolean }[]) => {
        if (!Array.isArray(items) || items.length === 0) return

        // Đơn tròng: nhóm theo categoryGroup
        const donItems = items.filter(i => (i.category ?? 'don-trong') === 'don-trong')
        const groupMap: Record<string, LensVariant[]> = {}
        donItems.forEach(item => {
          const g = item.categoryGroup ?? 'trang'
          if (!groupMap[g]) groupMap[g] = []
          groupMap[g].push({ id: item.id, name: item.name, price: item.price, badge: item.badge || undefined, features: item.features, suitableFor: item.suitableFor ?? '', recommended: item.recommended ?? false })
        })
        const cats: LensCategoryGroup[] = DON_GROUP_ORDER
          .filter(g => (groupMap[g]?.length ?? 0) > 0)
          .map(g => ({ id: g, ...(GROUP_META[g] ?? { name: g, icon: '🔵', desc: '' }), variants: groupMap[g] }))
        if (cats.length > 0) setDonTrongCats(cats)

        // Đa tròng: flat list
        const daItems = items.filter(i => i.category === 'da-trong')
        if (daItems.length > 0) {
          setDaTrong(daItems.map(i => ({ id: i.id, name: i.name, desc: i.desc, price: i.price, icon: GROUP_META[i.categoryGroup ?? '']?.icon ?? '👁️', badge: i.badge || undefined, features: i.features })))
        }
      })
      .catch(() => {})
  }, [])
  const [form, setForm] = useState<CheckoutForm>({
    name: '', phone: '', address: '', note: '', payment: '',
    rxMode: 'form',
    rxRight: { ...emptyEye }, rxLeft: { ...emptyEye }, rxAdd: '',
    rxImageBase64: '', rxImageName: '',
  })
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [orderCode, setOrderCode] = useState('')
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)


  const basePrice = product.basePrice
  const totalPrice = basePrice + (selectedLens?.price ?? 0)
  const discountedTotal = Math.round(totalPrice * (1 - DISCOUNT))
  const savedAmount = totalPrice - discountedTotal

  function goToCheckout(lens: LensOption | null) {
    setSelectedLens(lens)
    setForm(f => ({ ...f, payment: '' }))
    setStep('checkout')
  }

  function handleSelectCategory(cat: LensCategoryGroup) {
    setSelectedCategory(cat)
    if (cat.variants.length === 1) {
      const v = cat.variants[0]
      goToCheckout({ id: v.id, name: cat.name, desc: v.suitableFor, price: v.price, icon: cat.icon, badge: v.badge, features: v.features })
    } else {
      setStep('don-trong-detail')
    }
  }

  function handleSelectVariant(variant: LensVariant) {
    goToCheckout({
      id: variant.id,
      name: selectedCategory!.variants.length === 1 ? selectedCategory!.name : `${selectedCategory!.name} — ${variant.name}`,
      desc: variant.suitableFor,
      price: variant.price,
      icon: selectedCategory!.icon,
      badge: variant.badge,
      features: variant.features,
    })
  }

  function validate() {
    const e: Partial<CheckoutForm> = {}
    if (!form.name.trim()) e.name = 'Vui lòng nhập họ tên'
    if (!form.phone.trim() || !/^0\d{9}$/.test(form.phone.trim())) e.phone = 'Số điện thoại không hợp lệ'
    if (!form.address.trim()) e.address = 'Vui lòng nhập địa chỉ'
    if (!form.payment) e.payment = 'Vui lòng chọn phương thức thanh toán'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleConfirm() {
    if (!validate()) return
    setSubmitting(true)
    setSubmitError('')

    const code = 'SONI' + Date.now().toString().slice(-7)
    setOrderCode(code)

    const isCOD = form.payment === 'cod'
    const isDeposit = form.payment.startsWith('deposit')
    const payAmount = isDeposit
      ? Math.round((selectedLens?.price ?? 0) * (1 - DISCOUNT) * 0.5)
      : discountedTotal

    const paymentLabel = form.payment === 'cod' ? 'COD - Thu hộ khi giao' :
      form.payment === 'deposit-bank' ? `Cọc 50% tròng ${formatVND(payAmount)} - Chuyển khoản MB` :
      form.payment === 'deposit-momo' ? `Cọc 50% tròng ${formatVND(payAmount)} - MoMo` :
      form.payment === 'full-bank' ? `Toàn bộ ${formatVND(payAmount)} - Chuyển khoản MB` :
      form.payment === 'full-momo' ? `Toàn bộ ${formatVND(payAmount)} - MoMo` :
      form.payment === 'bank' ? 'Chuyển khoản MB' :
      form.payment === 'momo' ? 'MoMo' : form.payment

    const rxText = selectedLens
      ? form.rxMode === 'image'
        ? '[Ảnh đơn thuốc đính kèm]'
        : `MP: SPH ${form.rxRight.sph||'?'} / CYL ${form.rxRight.cyl||'?'} / Trục ${form.rxRight.axis||'?'} | MT: SPH ${form.rxLeft.sph||'?'} / CYL ${form.rxLeft.cyl||'?'} / Trục ${form.rxLeft.axis||'?'}${form.rxAdd ? ` | ADD ${form.rxAdd}` : ''}`
      : 'Không cần (chỉ gọng)'

    try {
      await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderCode: code,
          name: form.name,
          phone: form.phone,
          address: form.address,
          note: form.note,
          product: product.name,
          productId: product.id,
          lens: selectedLens?.name ?? 'Chỉ Gọng',
          total: formatVND(discountedTotal),
          originalTotal: formatVND(totalPrice),
          discount: '20%',
          payment: paymentLabel,
          payAmount,
          prescription: rxText,
          prescriptionImage: form.rxMode === 'image' ? form.rxImageBase64 : '',
          variantIds: product.colorVariants.map(v => v.id),
        }),
      })
    } catch {
      // Không chặn flow nếu network lỗi
    }

    setSubmitting(false)
    invalidateStockCache() // Force UI cập nhật tồn kho mới
    setStep('success')
  }

  const headerTitle =
    step === 'main' ? 'Chọn Loại Tròng' :
    step === 'don-trong' ? 'Đơn Tròng' :
    step === 'don-trong-detail' ? (selectedCategory?.name ?? 'Chọn Tròng') :
    step === 'da-trong' ? 'Hai Tròng / Đa Tròng' :
    step === 'checkout' ? 'Thông Tin Đặt Hàng' : 'Đặt Hàng Thành Công'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={step === 'success' ? onClose : undefined} />

      <div className="relative w-full sm:w-[500px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[95vh] sm:max-h-[92vh] overflow-y-auto overscroll-contain">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-brand-border px-5 py-4 flex items-center gap-3 z-10 rounded-t-3xl">
          {(step === 'don-trong' || step === 'don-trong-detail' || step === 'da-trong' || step === 'checkout') && (
            <button
              onClick={() => {
                if (step === 'checkout') {
                  if (!selectedLens) { setStep('main'); return }
                  if (selectedLens.id.startsWith('da')) { setStep('da-trong'); return }
                  if (selectedCategory && selectedCategory.variants.length > 1) { setStep('don-trong-detail'); return }
                  setStep('don-trong')
                } else if (step === 'don-trong-detail') {
                  setStep('don-trong')
                } else {
                  setStep('main')
                }
              }}
              className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-brand-light">
              <Image src={product.images?.[0] ?? '/images/logo.png'} alt={product.name} fill className="object-cover" sizes="48px" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-brand-black leading-tight line-clamp-1">{product.name}</p>
              <p className="text-xs text-brand-muted mt-0.5">{headerTitle}</p>
            </div>
          </div>
          {step !== 'success' && (
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Giá */}
        {step !== 'success' && (
          <div className="px-5 pt-4 pb-1 flex items-center justify-between border-b border-gray-50">
            <span className="text-xs text-brand-muted">
              {selectedLens && step === 'checkout' ? `Gọng + ${selectedLens.name}` : 'Giá gọng'}
            </span>
            <div className="flex items-baseline gap-2">
              {step === 'checkout' ? (
                <div className="text-right">
                  <span className="font-black text-brand-black">{formatVND(discountedTotal)}</span>
                  <span className="ml-1.5 text-xs text-gray-400 line-through">{formatVND(totalPrice)}</span>
                </div>
              ) : (
                <span className="font-black text-brand-black">{formatVND(basePrice)}</span>
              )}
              {product.originalPrice && step !== 'checkout' && (
                <span className="text-xs text-gray-400 line-through">{formatVND(product.originalPrice)}</span>
              )}
            </div>
          </div>
        )}

        <div className="px-5 pb-6 pt-4 space-y-3">

          {/* ── BƯỚC 1: Chọn nhóm ── */}
          {step === 'main' && (
            <>
              <div className="pb-1">
                <p className="font-bold text-base text-brand-black">Chọn Loại Tròng</p>
                <p className="text-xs text-brand-muted mt-0.5">Thêm tròng kính phù hợp nhu cầu của bạn</p>
              </div>

              {/* Chỉ mua gọng */}
              <button onClick={() => goToCheckout(null)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-brand-border hover:border-brand-black bg-white transition-all active:scale-95 group">
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0 border border-gray-200">🕶️</div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-brand-black text-sm">Chỉ Mua Gọng</p>
                  <p className="text-xs text-brand-muted mt-0.5">Mua gọng, tự lắp tròng sau</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-brand-black text-sm">{formatVND(basePrice)}</p>
                  <svg className="w-4 h-4 text-brand-muted ml-auto mt-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Đơn Tròng */}
              <button onClick={() => setStep('don-trong')}
                className="w-full flex items-start gap-4 p-4 rounded-2xl border-2 border-brand-border hover:border-brand-black bg-white transition-all active:scale-95 group text-left">
                <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100 mt-0.5">
                  <svg viewBox="0 0 56 56" className="w-10 h-10">
                    <ellipse cx="28" cy="28" rx="22" ry="14" fill="none" stroke="#60a5fa" strokeWidth="3"/>
                    <ellipse cx="28" cy="28" rx="12" ry="7" fill="#bfdbfe"/>
                    <circle cx="28" cy="28" r="4" fill="#3b82f6"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-brand-black text-sm">Đơn Tròng</p>
                    <svg className="w-4 h-4 text-brand-muted flex-shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-xs text-brand-muted mt-0.5">5 loại tròng — từ {formatVND(300000)}</p>
                  <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                    <p className="text-xs font-semibold text-gray-500">👤 Dành cho:</p>
                    <p className="text-xs text-brand-muted leading-relaxed">Người cận, viễn hoặc loạn thị ở một khoảng cách — đọc sách, dùng máy tính hoặc nhìn xa.</p>
                    <p className="text-xs font-semibold text-gray-500 pt-1">✨ Tính năng:</p>
                    <div className="flex flex-wrap gap-1">
                      {['Chống UV400', 'Chống ánh sáng xanh', 'Tự đổi màu', 'Tròng mỏng Hi-Index', 'Phân cực chống chói'].map(f => (
                        <span key={f} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full border border-blue-100">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>

              {/* Đa Tròng */}
              <button onClick={() => setStep('da-trong')}
                className="w-full flex items-start gap-4 p-4 rounded-2xl border-2 border-brand-border hover:border-brand-black bg-white transition-all active:scale-95 group text-left">
                <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 border border-purple-100 mt-0.5">
                  <svg viewBox="0 0 56 56" className="w-10 h-10">
                    <ellipse cx="28" cy="22" rx="22" ry="11" fill="none" stroke="#a78bfa" strokeWidth="3"/>
                    <ellipse cx="28" cy="34" rx="22" ry="11" fill="none" stroke="#c4b5fd" strokeWidth="2" strokeDasharray="4 2"/>
                    <ellipse cx="28" cy="22" rx="10" ry="5" fill="#ddd6fe"/>
                    <circle cx="28" cy="22" r="3" fill="#7c3aed"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-brand-black text-sm">Hai Tròng / Đa Tròng</p>
                    <svg className="w-4 h-4 text-brand-muted flex-shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <p className="text-xs text-brand-muted mt-0.5">3 loại tròng — từ {formatVND(1500000)}</p>
                  <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                    <p className="text-xs font-semibold text-gray-500">👤 Dành cho:</p>
                    <p className="text-xs text-brand-muted leading-relaxed">Người trên 40 tuổi hoặc cần nhìn rõ cả gần lẫn xa mà không cần đổi kính.</p>
                    <p className="text-xs font-semibold text-gray-500 pt-1">✨ Tính năng:</p>
                    <div className="flex flex-wrap gap-1">
                      {['Nhìn gần + trung + xa', 'Không đường phân cách', 'Chống UV400', 'Tròng mỏng cao cấp', 'Chống ánh sáng xanh'].map(f => (
                        <span key={f} className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded-full border border-purple-100">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            </>
          )}

          {/* ── BƯỚC 2a: Chọn loại tròng (category) ── */}
          {step === 'don-trong' && (
            <div className="space-y-2.5">
              <div className="pb-1">
                <p className="font-bold text-base text-brand-black">Chọn Loại Tròng</p>
                <p className="text-xs text-brand-muted mt-0.5">Chọn loại phù hợp, rồi chọn mức giá theo độ mắt</p>
              </div>
              {donTrongCats.map(cat => {
                const minPrice = Math.min(...cat.variants.map(v => v.price))
                return (
                  <button key={cat.id} onClick={() => handleSelectCategory(cat)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 border-brand-border hover:border-brand-black bg-white transition-all active:scale-95 group text-left">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0 border border-gray-200">
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-brand-black">{cat.name}</span>
                        {cat.badge && (
                          <span className="text-[10px] bg-brand-gold text-white font-bold px-1.5 py-0.5 rounded-full">{cat.badge}</span>
                        )}
                        {cat.variants.length > 1 && (
                          <span className="text-[10px] text-brand-muted bg-gray-100 px-1.5 py-0.5 rounded-full">{cat.variants.length} loại</span>
                        )}
                      </div>
                      <p className="text-xs text-brand-muted mt-0.5 leading-snug line-clamp-1">{cat.desc}</p>
                    </div>
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-0.5">
                      <span className="text-[10px] text-brand-muted">từ</span>
                      <span className="font-black text-sm text-brand-black">+{formatVND(minPrice)}</span>
                      <svg className="w-4 h-4 text-brand-muted group-hover:text-brand-black group-hover:translate-x-0.5 transition-all mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* ── BƯỚC 2b: Chọn variant trong loại đã chọn ── */}
          {step === 'don-trong-detail' && selectedCategory && (
            <div className="space-y-3">
              {/* Header loại tròng */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-brand-border">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl border border-gray-200 flex-shrink-0">
                  {selectedCategory.icon}
                </div>
                <div>
                  <p className="font-bold text-sm text-brand-black">{selectedCategory.name}</p>
                  <p className="text-xs text-brand-muted leading-snug">{selectedCategory.desc}</p>
                </div>
              </div>

              <p className="text-xs font-semibold text-brand-muted px-1">Chọn mức phù hợp với độ mắt của bạn:</p>

              {[...selectedCategory.variants].sort((a, b) => b.price - a.price).map(variant => (
                <button key={variant.id} onClick={() => handleSelectVariant(variant)}
                  className={`w-full text-left p-4 rounded-2xl border-2 bg-white transition-all active:scale-95 group ${variant.recommended ? 'border-brand-black hover:border-black' : 'border-brand-border hover:border-gray-400'}`}>
                  {variant.recommended && (
                    <div className="flex justify-end mb-1.5">
                      <span className="text-[10px] bg-brand-black text-white font-bold px-2 py-0.5 rounded-full">✓ Phổ biến nhất</span>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-brand-black">{variant.name}</span>
                        {variant.badge && !variant.recommended && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-full">{variant.badge}</span>
                        )}
                      </div>
                      {/* Phạm vi độ mắt */}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                          👁 {variant.suitableFor}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {variant.features.map(f => (
                          <span key={f} className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full border border-green-100">✓ {f}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-0.5">
                      <span className="font-black text-base text-brand-black">+{formatVND(variant.price)}</span>
                      <span className="text-xs text-red-500 font-semibold">= {formatVND(Math.round((basePrice + variant.price) * 0.8))}</span>
                      <span className="text-[10px] text-gray-400 line-through">{formatVND(basePrice + variant.price)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── BƯỚC 2c: Đa tròng ── */}
          {step === 'da-trong' && (
            <div className="space-y-3">
              <div className="pb-1">
                <p className="font-bold text-base text-brand-black">Hai Tròng / Đa Tròng</p>
                <p className="text-xs text-brand-muted mt-0.5">Chọn loại tròng bạn muốn lắp</p>
              </div>
              {daTrong.map(lens => (
                <button key={lens.id} onClick={() => goToCheckout(lens)}
                  className="w-full flex items-start gap-4 p-4 rounded-2xl border-2 border-brand-border hover:border-brand-zalo bg-white transition-all active:scale-95 group text-left">
                  <LensIcon icon={lens.icon} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-brand-black">{lens.name}</span>
                      {lens.badge && (
                        <span className="text-[10px] bg-brand-gold text-white font-bold px-1.5 py-0.5 rounded-full">{lens.badge}</span>
                      )}
                    </div>
                    <p className="text-xs text-brand-muted mt-0.5 leading-relaxed">{lens.desc}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {lens.features.map(f => (
                        <span key={f} className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full border border-green-200">✓ {f}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                    <span className="font-black text-sm text-brand-black">+{formatVND(lens.price)}</span>
                    <span className="text-[11px] text-red-500 font-semibold">= {formatVND(Math.round((basePrice + lens.price) * 0.8))}</span>
                    <span className="text-[10px] text-gray-400 line-through">{formatVND(basePrice + lens.price)}</span>
                    <svg className="w-4 h-4 text-brand-muted group-hover:text-brand-zalo group-hover:translate-x-0.5 transition-all mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── BƯỚC 3: Checkout ── */}
          {step === 'checkout' && (
            <div className="space-y-5">
              {/* Tóm tắt đơn */}
              <div className="bg-brand-light rounded-2xl p-4 space-y-2">
                <p className="text-xs font-bold text-brand-black uppercase tracking-wide">Tóm tắt đơn hàng</p>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-muted">Gọng kính</span>
                  <span className="font-semibold">{formatVND(basePrice)}</span>
                </div>
                {selectedLens && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-muted">{selectedLens.name}</span>
                    <span className="font-semibold">+{formatVND(selectedLens.price)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t border-brand-border pt-2">
                  <span className="text-brand-muted">Tạm tính</span>
                  <span className="font-semibold text-gray-400 line-through">{formatVND(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-semibold flex items-center gap-1">
                    🎉 Giảm 20%
                  </span>
                  <span className="font-bold text-green-600">-{formatVND(savedAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-brand-border pt-2">
                  <span className="font-bold text-brand-black">Tổng thanh toán</span>
                  <span className="font-black text-red-600 text-lg">{formatVND(discountedTotal)}</span>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-3">
                <p className="text-sm font-bold text-brand-black">Thông tin giao hàng</p>

                <div>
                  <input
                    type="text" placeholder="Họ và tên *" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${errors.name ? 'border-red-400 bg-red-50' : 'border-brand-border focus:border-brand-black'}`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <input
                    type="tel" placeholder="Số điện thoại * (VD: 0901234567)" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${errors.phone ? 'border-red-400 bg-red-50' : 'border-brand-border focus:border-brand-black'}`}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <textarea
                    placeholder="Địa chỉ giao hàng * (Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành)" value={form.address} rows={2}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none ${errors.address ? 'border-red-400 bg-red-50' : 'border-brand-border focus:border-brand-black'}`}
                  />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>

                {/* Thông số độ mắt — chỉ hiện khi có tròng */}
                {selectedLens && (
                  <div className="border border-brand-border rounded-2xl overflow-hidden">
                    <div className="bg-brand-light px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-brand-black">Thông số độ mắt</p>
                        <p className="text-xs text-brand-muted">Điền để xưởng lắp đúng độ cho bạn</p>
                      </div>
                    </div>

                    {/* Toggle form / ảnh */}
                    <div className="px-4 pt-3 pb-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, rxMode: 'form' }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${form.rxMode === 'form' ? 'border-brand-black bg-brand-black text-white' : 'border-brand-border text-brand-muted hover:border-gray-400'}`}
                      >
                        ✏️ Tự điền thông số
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, rxMode: 'image' }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${form.rxMode === 'image' ? 'border-brand-black bg-brand-black text-white' : 'border-brand-border text-brand-muted hover:border-gray-400'}`}
                      >
                        📷 Chụp/upload ảnh
                      </button>
                    </div>

                    {/* Form điền tay */}
                    {form.rxMode === 'form' && (
                      <div className="px-4 pb-4 space-y-3">
                        {/* Header bảng */}
                        <div className="grid grid-cols-4 gap-1 mt-1">
                          <div />
                          {[
                            { label: 'Độ Cận/Viễn', sub: 'SPH' },
                            { label: 'Độ Loạn', sub: 'CYL' },
                            { label: 'Trục Loạn', sub: 'AXIS' },
                          ].map(h => (
                            <div key={h.sub} className="text-center">
                              <div className="text-[10px] font-bold text-brand-black leading-tight">{h.label}</div>
                              <div className="text-[9px] text-brand-muted">{h.sub}</div>
                            </div>
                          ))}
                        </div>

                        {/* Mắt phải */}
                        <div className="grid grid-cols-4 gap-1 items-center">
                          <div className="text-xs font-bold text-brand-black">
                            Mắt P<br/><span className="text-[10px] text-brand-muted font-normal">(OD)</span>
                          </div>
                          {(['sph', 'cyl', 'axis'] as const).map(field => (
                            <input key={field} type="text"
                              placeholder={field === 'axis' ? '0–180' : '±0.00'}
                              value={form.rxRight[field]}
                              onChange={e => setForm(f => ({ ...f, rxRight: { ...f.rxRight, [field]: e.target.value } }))}
                              className="border border-brand-border rounded-lg px-2 py-2 text-xs text-center outline-none focus:border-brand-black transition-colors"
                            />
                          ))}
                        </div>

                        {/* Mắt trái */}
                        <div className="grid grid-cols-4 gap-1 items-center">
                          <div className="text-xs font-bold text-brand-black">
                            Mắt T<br/><span className="text-[10px] text-brand-muted font-normal">(OS)</span>
                          </div>
                          {(['sph', 'cyl', 'axis'] as const).map(field => (
                            <input key={field} type="text"
                              placeholder={field === 'axis' ? '0–180' : '±0.00'}
                              value={form.rxLeft[field]}
                              onChange={e => setForm(f => ({ ...f, rxLeft: { ...f.rxLeft, [field]: e.target.value } }))}
                              className="border border-brand-border rounded-lg px-2 py-2 text-xs text-center outline-none focus:border-brand-black transition-colors"
                            />
                          ))}
                        </div>

                        {/* ADD cho đa tròng */}
                        {selectedLens.id.startsWith('da') && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-brand-black w-16">ADD<br/><span className="text-[10px] text-brand-muted font-normal">(Thêm)</span></span>
                            <input type="text" placeholder="+0.00 đến +3.50"
                              value={form.rxAdd}
                              onChange={e => setForm(f => ({ ...f, rxAdd: e.target.value }))}
                              className="border border-brand-border rounded-lg px-3 py-2 text-xs text-center outline-none focus:border-brand-black transition-colors w-36"
                            />
                          </div>
                        )}

                        <p className="text-[10px] text-brand-muted bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                          💡 Ví dụ: Cầu <strong>-2.50</strong>, Trụ <strong>-0.75</strong>, Trục <strong>90</strong>. Xem trên đơn thuốc của bác sĩ mắt.
                        </p>
                      </div>
                    )}

                    {/* Upload ảnh */}
                    {form.rxMode === 'image' && (
                      <div className="px-4 pb-4 space-y-3">
                        <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-5 cursor-pointer transition-colors ${form.rxImageBase64 ? 'border-green-400 bg-green-50' : 'border-brand-border hover:border-gray-400 bg-gray-50'}`}>
                          <input type="file" accept="image/*" className="hidden"
                            onChange={e => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              const reader = new FileReader()
                              reader.onload = ev => {
                                setForm(f => ({
                                  ...f,
                                  rxImageBase64: ev.target?.result as string,
                                  rxImageName: file.name,
                                }))
                              }
                              reader.readAsDataURL(file)
                            }}
                          />
                          {form.rxImageBase64 ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={form.rxImageBase64} alt="preview" className="max-h-32 rounded-lg object-contain" />
                              <span className="text-xs text-green-700 font-semibold">✓ {form.rxImageName}</span>
                              <span className="text-xs text-brand-muted">Nhấn để đổi ảnh</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-8 h-8 text-brand-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                              </svg>
                              <span className="text-sm font-semibold text-brand-black">Chụp hoặc chọn ảnh đơn thuốc</span>
                              <span className="text-xs text-brand-muted">JPG, PNG — tối đa 5MB</span>
                            </>
                          )}
                        </label>
                        <p className="text-[10px] text-brand-muted bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                          💡 Chụp ảnh toa thuốc mắt hoặc kết quả khám — nhân viên SONi sẽ đọc và lắp đúng độ cho bạn.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Ghi chú thêm */}
                <input
                  type="text" placeholder="Ghi chú thêm (tuỳ chọn — yêu cầu đặc biệt...)" value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-black transition-colors"
                />
              </div>

              {/* Phương thức thanh toán */}
              <div className="space-y-2">
                <p className="text-sm font-bold text-brand-black">Phương thức thanh toán</p>
                {errors.payment && <p className="text-xs text-red-500">{errors.payment}</p>}

                {!selectedLens ? (
                  /* ── CHỈ GỌNG: COD + chuyển khoản + MoMo ── */
                  <>
                    {PAYMENT_METHODS.map(pm => (
                      <button key={pm.id} onClick={() => setForm(f => ({ ...f, payment: pm.id }))}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                          form.payment === pm.id ? 'border-brand-black bg-gray-50' : 'border-brand-border hover:border-gray-400'
                        }`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${pm.color}`}>{pm.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-brand-black">{pm.label}</span>
                            {pm.badge && <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full">{pm.badge}</span>}
                          </div>
                          <p className="text-xs text-brand-muted">{pm.sub}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${form.payment === pm.id ? 'border-brand-black' : 'border-gray-300'}`}>
                          {form.payment === pm.id && <div className="w-2.5 h-2.5 rounded-full bg-brand-black" />}
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  /* ── CÓ TRÒNG: bắt buộc cọc hoặc thanh toán toàn bộ ── */
                  <>
                    {/* Thông báo lý do */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2">
                      <span className="text-base flex-shrink-0">⚠️</span>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Đơn có <strong>tròng cắt theo số độ</strong> — cần cọc tiền tròng hoặc thanh toán toàn bộ trước khi xưởng tiến hành cắt kính.
                      </p>
                    </div>

                    {/* Option 1: Cọc tiền tròng */}
                    {[
                      {
                        id: 'deposit',
                        title: 'Cọc 50% tiền tròng',
                        amount: Math.round((selectedLens?.price ?? 0) * (1 - DISCOUNT) * 0.5),
                        originalAmount: selectedLens?.price ?? 0,
                        sub: 'Cọc 50% tròng — trả 50% còn lại + gọng khi nhận hàng',
                        badge: 'Linh hoạt',
                        badgeColor: 'bg-blue-100 text-blue-700',
                        icon: (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ),
                        color: 'text-blue-600 bg-blue-50 border-blue-200',
                      },
                      {
                        id: 'full',
                        title: 'Thanh toán toàn bộ',
                        amount: discountedTotal,
                        originalAmount: totalPrice,
                        sub: 'Thanh toán 100% — ưu tiên xử lý đơn trước',
                        badge: 'Ưu tiên',
                        badgeColor: 'bg-green-100 text-green-700',
                        icon: (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                          </svg>
                        ),
                        color: 'text-green-600 bg-green-50 border-green-200',
                      },
                    ].map(opt => (
                      <button key={opt.id} onClick={() => setForm(f => ({ ...f, payment: opt.id }))}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          form.payment === opt.id ? 'border-brand-black bg-gray-50' : 'border-brand-border hover:border-gray-400'
                        }`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${opt.color}`}>{opt.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-brand-black">{opt.title}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${opt.badgeColor}`}>{opt.badge}</span>
                            </div>
                            <p className="text-xs text-brand-muted mt-0.5">{opt.sub}</p>
                            <div className="flex items-baseline gap-2 mt-1.5">
                              <span className="text-base font-black text-red-600">{formatVND(opt.amount)}</span>
                              <span className="text-xs text-gray-400 line-through">{formatVND(opt.originalAmount)}</span>
                              <span className="text-xs text-green-600 font-semibold">(-20%)</span>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 ${form.payment === opt.id ? 'border-brand-black' : 'border-gray-300'}`}>
                            {form.payment === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-brand-black" />}
                          </div>
                        </div>
                        {/* Kênh chuyển khoản */}
                        {form.payment === opt.id && (
                          <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                            {[
                              { id: `${opt.id}-bank`, label: 'Chuyển khoản NH', icon: '🏦' },
                              { id: `${opt.id}-momo`, label: 'Ví MoMo', icon: '📱' },
                            ].map(ch => (
                              <button key={ch.id} type="button"
                                onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, payment: ch.id })) }}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${
                                  form.payment === ch.id ? 'border-brand-black bg-brand-black text-white' : 'border-brand-border hover:border-gray-400 text-brand-black'
                                }`}>
                                <span>{ch.icon}</span>{ch.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Nút xác nhận */}
              <button onClick={handleConfirm} disabled={submitting}
                className="w-full bg-brand-black hover:bg-gray-800 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all text-base shadow-lg">
                {submitting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Đang gửi đơn hàng...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Xác Nhận Đặt Hàng
                  </>
                )}
              </button>
              <p className="text-center text-xs text-brand-muted">🛡️ Đổi trả trong 7 ngày • Bảo hành 12 tháng</p>
            </div>
          )}

          {/* ── BƯỚC 4: QR Thanh toán / Thành công ── */}
          {step === 'success' && (
            <PaymentStep
              form={form}
              orderCode={orderCode}
              discountedTotal={discountedTotal}
              totalPrice={totalPrice}
              selectedLens={selectedLens}
              product={product}
              paymentConfirmed={paymentConfirmed}
              onConfirmed={() => setPaymentConfirmed(true)}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  )
}
