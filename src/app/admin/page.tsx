'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { Product } from '@/types/product'

const PASSWORD = 'Sonnguyen98'
const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

type Section = 'products' | 'stock' | 'lens' | 'blog' | 'stores' | 'policies'

const SECTIONS = [
  { id: 'products' as Section, label: 'Gọng Kính', icon: '👓' },
  { id: 'stock' as Section, label: 'Tồn Kho', icon: '📦' },
  { id: 'lens' as Section, label: 'Tròng Kính', icon: '🔵' },
  { id: 'blog' as Section, label: 'SONi Share', icon: '✍️' },
  { id: 'stores' as Section, label: 'Hệ Thống CH', icon: '🏪' },
  { id: 'policies' as Section, label: 'Chính Sách BH', icon: '🛡️' },
]

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [section, setSection] = useState<Section>('products')

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-white rounded-2xl p-8 w-80 shadow-2xl">
          <div className="text-center mb-6">
            <p className="text-2xl font-black text-gray-900">SONi Admin</p>
            <p className="text-sm text-gray-500 mt-1">Quản lý nội dung website</p>
          </div>
          <input type="password" placeholder="Mật khẩu" value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && pw === PASSWORD && setAuthed(true)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-900 mb-3" />
          <button onClick={() => pw === PASSWORD ? setAuthed(true) : alert('Sai mật khẩu')}
            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition-colors">
            Đăng nhập
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-56 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <p className="font-black text-gray-900">SONi Admin</p>
          <a href="/" target="_blank" className="text-xs text-blue-500 hover:underline">Xem website →</a>
        </div>
        <nav className="flex-1 py-3">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors text-left ${
                section === s.id ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              <span>{s.icon}</span>{s.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main */}
      <div className="ml-56 flex-1 p-6">
        {section === 'products' && <ProductsSection />}
        {section === 'stock' && <StockSection />}
        {section === 'lens' && <LensSection />}
        {section === 'blog' && <BlogSection />}
        {section === 'stores' && <StoresSection />}
        {section === 'policies' && <PoliciesSection />}
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle, onAdd }: { title: string; subtitle: string; onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-black text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      {onAdd && (
        <button onClick={onAdd}
          className="flex items-center gap-2 bg-gray-900 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors">
          + Thêm mới
        </button>
      )}
    </div>
  )
}

function SaveBtn({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={saving}
      className="bg-gray-900 text-white text-sm font-bold px-5 py-2 rounded-xl hover:bg-gray-700 disabled:opacity-50 transition-colors">
      {saving ? '⏳ Đang lưu...' : '💾 Lưu'}
    </button>
  )
}

function inp(extra = '') { return `w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-gray-900 transition-colors ${extra}` }

// ── PRODUCTS ─────────────────────────────────────────────────────────────────
function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/admin/products', { headers: { 'x-admin-token': PASSWORD } })
      const data = await r.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch { setProducts([]) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.includes(search) ||
    ((p as { sku?: string }).sku?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

  return (
    <div>
      <SectionHeader title="👓 Gọng Kính" subtitle={`${products.length} sản phẩm`}
        onAdd={() => setShowNew(true)} />
      <div className="flex gap-3 mb-4">
        <input placeholder="🔍 Tìm theo tên, mã SP..." value={search}
          onChange={e => setSearch(e.target.value)} className={inp('flex-1')} />
        <button onClick={load} className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm hover:bg-gray-50">↻</button>
      </div>
      {loading ? <p className="text-gray-400 text-sm">Đang tải...</p> : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative h-36 bg-gray-100">
                <Image src={p.images?.[0] ?? p.colorVariants[0]?.imageUrl ?? '/images/logo.png'}
                  alt={p.name} fill className="object-cover" unoptimized sizes="200px"/>
                <span className="absolute top-2 right-2 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded font-mono">{p.id}</span>
              </div>
              <div className="p-3">
                <p className="font-bold text-xs text-gray-900 line-clamp-1">{p.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{fmt(p.basePrice)}</p>
                <div className="mt-2 flex gap-1.5">
                  <button onClick={() => setEditing(p)}
                    className="flex-1 bg-gray-900 text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-gray-700">
                    ✏️ Sửa
                  </button>
                  <button onClick={async () => {
                    if (!confirm(`Xoá "${p.name}"?`)) return
                    const isNew = p.id.startsWith('sp') && p.id.length > 8
                    if (isNew) {
                      await fetch('/api/admin/new-products', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-admin-token': PASSWORD }, body: JSON.stringify({ id: p.id }) })
                    } else {
                      await fetch('/api/admin/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-admin-token': PASSWORD }, body: JSON.stringify({ id: p.id }) })
                    }
                    load()
                  }}
                    className="px-2.5 bg-red-50 text-red-600 text-xs font-semibold py-1.5 rounded-lg hover:bg-red-100 border border-red-200">
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && <ProductEditModal product={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />}
      {showNew && <NewProductModal onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); load() }} />}
    </div>
  )
}

// ── NEW PRODUCT MODAL ─────────────────────────────────────────────────────────
function NewProductModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [colors, setColors] = useState([{ name: 'Đen', hex: '#1A1A1A', quantity: 10 }])
  const [form, setForm] = useState({
    name: '', sku: '', brand: 'SONi', basePrice: '', originalPrice: '',
    description: '', features: '',
    type: 'full-rim', shape: 'round', material: 'metal', gender: 'unisex',
    isBestSeller: false, isNew: true,
  })

  async function handleUpload(file: File) {
    setUploading(true)
    const id = 'new-' + Date.now()
    const fd = new FormData(); fd.append('file', file); fd.append('productId', id)
    const r = await fetch('/api/admin/upload', { method: 'POST', headers: { 'x-admin-token': PASSWORD }, body: fd })
    const { url } = await r.json()
    setImages(p => [...p, url]); setUploading(false)
  }

  async function handleSave() {
    if (!form.name.trim()) { alert('Vui lòng nhập tên sản phẩm'); return }
    if (!form.basePrice) { alert('Vui lòng nhập giá bán'); return }
    if (images.length === 0) { alert('Vui lòng tải lên ít nhất 1 ảnh'); return }
    if (colors.every(c => !c.name.trim())) { alert('Vui lòng thêm ít nhất 1 màu sắc'); return }

    setSaving(true)
    const id = 'sp' + Date.now()
    const slug = form.name.toLowerCase()
      .replace(/[àáâãäå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u').replace(/[đ]/g, 'd')
      .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').slice(0, 60)

    const product = {
      id, slug, ...form,
      basePrice: Number(form.basePrice),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      rating: 4.5, reviewCount: 0,
      features: form.features.split('\n').filter(Boolean),
      colorVariants: colors.map((c, i) => ({
        id: `${id}-${i}`,
        name: c.name,
        hex: c.hex,
        imageUrl: images[0] ?? '',
        overlayImageUrl: `/images/overlays/${form.shape}-overlay.svg`,
        inStock: c.quantity > 0,
      })),
      specs: { bridgeWidth: 18, lensWidth: 50, templeLength: 145, frameWidth: 'Vừa', weight: 20 },
      images,
      modelImages: [],
      tags: [form.shape, form.material, form.gender],
    }

    // Đồng bộ số lượng vào stock.json
    const stockRes = await fetch('/api/admin/stock', { headers: { 'x-admin-token': PASSWORD } })
    const currentStock = await stockRes.json()
    colors.forEach((c, i) => {
      const varId = `${id}-${i}`
      currentStock[varId] = { inStock: c.quantity > 0, quantity: c.quantity }
    })
    await fetch('/api/admin/stock', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': PASSWORD },
      body: JSON.stringify(currentStock),
    })

    await fetch('/api/admin/new-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': PASSWORD },
      body: JSON.stringify(product),
    })
    setSaving(false); onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <p className="font-black text-gray-900">➕ Thêm Sản Phẩm Mới</p>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Ảnh */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Ảnh sản phẩm *</label>
            <label className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-xl py-4 cursor-pointer text-sm ${uploading ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-gray-300 bg-gray-50 hover:border-gray-500 text-gray-600'}`}>
              <input type="file" accept="image/*" multiple className="hidden"
                onChange={e => Array.from(e.target.files ?? []).forEach(handleUpload)} />
              {uploading ? '⏳ Đang tải...' : '📷 Tải ảnh lên (có thể chọn nhiều ảnh)'}
            </label>
            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-2">
                {images.map((url, i) => (
                  <div key={url} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image src={url} alt="" fill className="object-cover" unoptimized sizes="80px"/>
                    <button onClick={() => setImages(p => p.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center">✕</button>
                    {i === 0 && <span className="absolute bottom-1 left-1 text-[9px] bg-yellow-400 text-yellow-900 font-bold px-1 rounded">Chính</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Tên sản phẩm *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp()} placeholder="VD: Gọng Tròn Kim Loại Retro" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Mã SP (SKU)</label>
              <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className={inp()} placeholder="VD: SP001" /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Giá bán (đ) *</label>
              <input type="number" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} className={inp()} placeholder="590000" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Giá gốc (đ)</label>
              <input type="number" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} className={inp()} placeholder="890000" /></div>
          </div>

          <div><label className="block text-xs font-semibold text-gray-600 mb-1">Mô tả sản phẩm</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inp('resize-none')} /></div>

          <div><label className="block text-xs font-semibold text-gray-600 mb-1">Đặc điểm nổi bật (mỗi dòng 1 đặc điểm)</label>
            <textarea rows={3} value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} className={inp('resize-none')}
              placeholder="Titanium siêu nhẹ&#10;Bảo hành 2 năm&#10;Phù hợp mọi khuôn mặt" /></div>

          {/* Phân loại */}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Loại gọng</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inp()}>
                <option value="full-rim">Full Viền</option>
                <option value="rimless">Không Viền</option>
                <option value="semi-rimless">Nửa Viền</option>
              </select></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Hình dáng</label>
              <select value={form.shape} onChange={e => setForm(f => ({ ...f, shape: e.target.value }))} className={inp()}>
                <option value="round">Mắt Tròn</option>
                <option value="square">Mắt Vuông</option>
                <option value="rectangle">Chữ Nhật</option>
                <option value="cat-eye">Mắt Mèo</option>
                <option value="oval">Oval</option>
                <option value="geometric">Đa Giác</option>
              </select></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Chất liệu</label>
              <select value={form.material} onChange={e => setForm(f => ({ ...f, material: e.target.value }))} className={inp()}>
                <option value="metal">Kim Loại</option>
                <option value="plastic">Nhựa</option>
                <option value="titanium">Titanium</option>
                <option value="combination">Kết Hợp</option>
              </select></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Giới tính</label>
              <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className={inp()}>
                <option value="unisex">Unisex</option>
                <option value="nam">Nam</option>
                <option value="nu">Nữ</option>
              </select></div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isBestSeller} onChange={e => setForm(f => ({ ...f, isBestSeller: e.target.checked }))} />
              <span className="text-sm">🏆 Bán Chạy</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isNew} onChange={e => setForm(f => ({ ...f, isNew: e.target.checked }))} />
              <span className="text-sm">✨ Hàng Mới</span>
            </label>
          </div>

          {/* Màu sắc */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600">Màu sắc *</label>
              <button onClick={() => setColors(c => [...c, { name: '', hex: '#888888', quantity: 10 }])}
                className="text-xs text-blue-600 font-semibold hover:underline">+ Thêm màu</button>
            </div>
            <div className="space-y-2">
              {colors.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="color" value={c.hex}
                    onChange={e => setColors(p => p.map((x, j) => j === i ? { ...x, hex: e.target.value } : x))}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-gray-300 p-0.5" />
                  <input value={c.name} placeholder="Tên màu (VD: Đen Bóng)"
                    onChange={e => setColors(p => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                    className={inp('flex-1')} />
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-xs text-gray-400">SL:</span>
                    <input
                      type="number" min={0} value={c.quantity}
                      onChange={e => setColors(p => p.map((x, j) => j === i ? { ...x, quantity: Math.max(0, +e.target.value) } : x))}
                      className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center outline-none focus:border-gray-900"
                    />
                  </div>
                  {colors.length > 1 && (
                    <button onClick={() => setColors(p => p.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-600 text-sm flex-shrink-0">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold">Huỷ</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-700 disabled:opacity-50 transition-colors">
            {saving ? '⏳ Đang lưu...' : '✓ Tạo Sản Phẩm'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── STOCK ────────────────────────────────────────────────────────────────────
type StockMap = Record<string, { inStock: boolean; quantity: number }>

function StockSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [stock, setStock] = useState<StockMap>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/products', { headers: { 'x-admin-token': PASSWORD } }).then(r => r.json()),
      fetch('/api/admin/stock', { headers: { 'x-admin-token': PASSWORD } }).then(r => r.json()),
    ]).then(([prods, stk]) => {
      setProducts(Array.isArray(prods) ? prods : [])
      setStock(stk && typeof stk === 'object' && !Array.isArray(stk) ? stk : {})
    })
  }, [])

  function getStock(variantId: string, field: 'inStock' | 'quantity', defaultVal: boolean | number) {
    return stock[variantId]?.[field] ?? defaultVal
  }

  function updateVariant(variantId: string, field: 'inStock' | 'quantity', value: boolean | number) {
    setStock(s => {
      const current = s[variantId] ?? { inStock: true, quantity: 0 }
      return { ...s, [variantId]: { ...current, [field]: value } }
    })
    setSaved(false)
  }

  async function saveAll() {
    setSaving(true)
    // Tự động đặt inStock=false khi SL=0, inStock=true khi SL>0
    const corrected = Object.fromEntries(
      Object.entries(stock).map(([id, s]) => [
        id,
        { ...s, inStock: s.quantity > 0 }
      ])
    )
    await fetch('/api/admin/stock', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': PASSWORD },
      body: JSON.stringify(corrected),
    })
    setStock(corrected)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.id.includes(search)
  )

  const outOfStockCount = products.reduce((acc, p) =>
    acc + p.colorVariants.filter(v => getStock(v.id, 'inStock', v.inStock) === false).length, 0
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">📦 Quản Lý Tồn Kho</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {products.reduce((a, p) => a + p.colorVariants.length, 0)} màu sắc •
            <span className="text-red-500 font-semibold ml-1">{outOfStockCount} hết hàng</span>
          </p>
        </div>
        <button onClick={saveAll} disabled={saving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            saved ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50'
          }`}>
          {saving ? '⏳ Đang lưu...' : saved ? '✓ Đã lưu!' : '💾 Lưu tất cả'}
        </button>
      </div>

      <input placeholder="🔍 Tìm sản phẩm..." value={search}
        onChange={e => setSearch(e.target.value)} className={inp('mb-4')} />

      <div className="space-y-3">
        {filtered.map(p => {
          const thumb = p.images?.[0] ?? p.colorVariants[0]?.imageUrl
          const hasOutOfStock = p.colorVariants.some(v => getStock(v.id, 'inStock', v.inStock) === false)
          return (
            <div key={p.id} className={`bg-white rounded-2xl border overflow-hidden ${hasOutOfStock ? 'border-red-200' : 'border-gray-200'}`}>
              {/* Product header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  <Image src={thumb} alt={p.name} fill className="object-cover" unoptimized sizes="40px"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 line-clamp-1">{p.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-gray-400">{p.id}</p>
                    {(p as { sku?: string }).sku && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded">
                        {(p as { sku?: string }).sku}
                      </span>
                    )}
                  </div>
                </div>
                {hasOutOfStock && (
                  <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                    Có màu hết hàng
                  </span>
                )}
              </div>

              {/* Color variants */}
              <div className="divide-y divide-gray-50">
                {p.colorVariants.map(v => {
                  const isInStock = getStock(v.id, 'inStock', v.inStock) as boolean
                  const qty = getStock(v.id, 'quantity', 0) as number
                  return (
                    <div key={v.id} className={`flex items-center gap-4 px-4 py-3 ${!isInStock ? 'bg-red-50/50' : ''}`}>
                      {/* Color swatch */}
                      <div className="w-7 h-7 rounded-full border-2 border-white shadow flex-shrink-0"
                        style={{ backgroundColor: v.hex }}/>
                      <p className="text-sm text-gray-700 flex-1 min-w-0 truncate">{v.name}</p>

                      {/* Quantity */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-400">SL:</span>
                        <input
                          type="number" min={0} value={qty}
                          onChange={e => updateVariant(v.id, 'quantity', Math.max(0, +e.target.value))}
                          className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center outline-none focus:border-gray-900"
                        />
                      </div>

                      {/* Toggle còn/hết hàng */}
                      <button
                        onClick={() => updateVariant(v.id, 'inStock', !isInStock)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                          isInStock
                            ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                            : 'bg-red-50 text-red-600 border-red-300 hover:bg-red-100'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${isInStock ? 'bg-green-500' : 'bg-red-500'}`}/>
                        {isInStock ? 'Còn hàng' : 'Hết hàng'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── LENS ─────────────────────────────────────────────────────────────────────
interface LensItem { id: string; name: string; desc: string; price: number; badge: string; image: string; features: string[] }

function LensSection() {
  const [items, setItems] = useState<LensItem[]>([])
  const [editing, setEditing] = useState<LensItem | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/content/lens-products', { headers: { 'x-admin-token': PASSWORD } })
      .then(r => r.json()).then(d => setItems(Array.isArray(d) ? d : []))
  }, [])

  async function save(item: LensItem) {
    setSaving(true)
    const next = isNew ? [...items, item] : items.map(i => i.id === item.id ? item : i)
    await fetch('/api/admin/content/lens-products', {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': PASSWORD },
      body: JSON.stringify(next)
    })
    setItems(next); setSaving(false); setEditing(null)
  }

  async function del(id: string) {
    if (!confirm('Xoá tròng kính này?')) return
    const next = items.filter(i => i.id !== id)
    await fetch('/api/admin/content/lens-products', {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': PASSWORD },
      body: JSON.stringify(next)
    })
    setItems(next)
  }

  return (
    <div>
      <SectionHeader title="🔵 Tròng Kính" subtitle={`${items.length} loại tròng`}
        onAdd={() => { setEditing({ id: `trong-${Date.now()}`, name: '', desc: '', price: 0, badge: '', image: '', features: [] }); setIsNew(true) }} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex">
            {/* Ảnh */}
            <div className="w-24 h-24 flex-shrink-0 bg-gray-100 relative self-stretch">
              {item.image
                ? <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized/>
                : <div className="w-full h-full flex items-center justify-center text-2xl">🔵</div>
              }
            </div>
            <div className="flex-1 p-3 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-sm text-gray-900 line-clamp-1">{item.name}</p>
                {item.badge && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">{item.badge}</span>}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.desc}</p>
              <p className="text-sm font-black text-gray-900 mt-1">{fmt(item.price)}</p>
            </div>
            <div className="flex flex-col gap-1.5 p-3 flex-shrink-0 justify-center">
              <button onClick={() => { setEditing(item); setIsNew(false) }} className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg">Sửa</button>
              <button onClick={() => del(item.id)} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg">Xoá</button>
            </div>
          </div>
        ))}
      </div>
      {editing && <LensEditModal item={editing} saving={saving} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  )
}

function LensEditModal({ item, saving, onSave, onClose }: {
  item: LensItem; saving: boolean; onSave: (item: LensItem) => void; onClose: () => void
}) {
  const [form, setForm] = useState({ ...item, features: item.features.join('\n') })
  const [uploading, setUploading] = useState(false)

  async function handleUpload(file: File) {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'lens')
    const r = await fetch('/api/admin/upload-content', { method: 'POST', headers: { 'x-admin-token': PASSWORD }, body: fd })
    const { url } = await r.json()
    setForm(f => ({ ...f, image: url }))
    setUploading(false)
  }

  function handleSave() {
    onSave({ ...form, price: Number(form.price), features: form.features.split('\n').filter(Boolean) })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <p className="font-black text-gray-900">Tròng Kính</p>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* Ảnh sản phẩm */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Ảnh sản phẩm</label>
            <div className="flex gap-3 items-start">
              {/* Preview */}
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 relative">
                {form.image
                  ? <Image src={form.image} alt="preview" fill className="object-cover" unoptimized/>
                  : <div className="w-full h-full flex items-center justify-center text-3xl">🔵</div>
                }
              </div>
              <div className="flex-1 space-y-2">
                <label className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-xl py-3 cursor-pointer text-sm transition-colors ${uploading ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-gray-300 bg-gray-50 hover:border-gray-500 text-gray-600'}`}>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                  {uploading ? '⏳ Đang tải...' : '📷 Tải ảnh lên'}
                </label>
                <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  className={inp()} placeholder="Hoặc dán URL ảnh..." />
              </div>
            </div>
          </div>

          <div><label className="block text-xs font-semibold text-gray-600 mb-1">Tên tròng kính *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp()} /></div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1">Mô tả</label>
            <input value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} className={inp()} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Giá (đ)</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} className={inp()} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Badge</label>
              <input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} className={inp()} placeholder="Phổ biến, Cao cấp..." /></div>
          </div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1">Tính năng (mỗi dòng 1 tính năng)</label>
            <textarea rows={4} value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))}
              className={inp('resize-none')} placeholder="Chống UV400&#10;Phủ chống trầy&#10;..." /></div>
        </div>
        <div className="px-5 py-4 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold">Huỷ</button>
          <SaveBtn saving={saving} onClick={handleSave} />
        </div>
      </div>
    </div>
  )
}

// ── BLOG ─────────────────────────────────────────────────────────────────────
interface BlogPost { id: string; slug: string; title: string; excerpt: string; content: string; date: string; category: string; image: string; published: boolean }

function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/content/blog-posts', { headers: { 'x-admin-token': PASSWORD } })
      .then(r => r.json()).then(d => setPosts(Array.isArray(d) ? d : []))
  }, [])

  async function save(item: BlogPost) {
    setSaving(true)
    const next = isNew ? [...posts, item] : posts.map(p => p.id === item.id ? item : p)
    await fetch('/api/admin/content/blog-posts', {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': PASSWORD },
      body: JSON.stringify(next)
    })
    setPosts(next); setSaving(false); setEditing(null)
  }

  async function del(id: string) {
    if (!confirm('Xoá bài viết này?')) return
    const next = posts.filter(p => p.id !== id)
    await fetch('/api/admin/content/blog-posts', {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': PASSWORD },
      body: JSON.stringify(next)
    })
    setPosts(next)
  }

  async function toggle(post: BlogPost) {
    const updated = { ...post, published: !post.published }
    const next = posts.map(p => p.id === post.id ? updated : p)
    await fetch('/api/admin/content/blog-posts', {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': PASSWORD },
      body: JSON.stringify(next)
    })
    setPosts(next)
  }

  const newPost = (): BlogPost => ({
    id: `post-${Date.now()}`, slug: '', title: '', excerpt: '', content: '',
    date: new Date().toLocaleDateString('vi-VN'), category: 'Kiến Thức', image: '', published: false
  })

  return (
    <div>
      <SectionHeader title="✍️ SONi Share" subtitle={`${posts.length} bài viết`}
        onAdd={() => { setEditing(newPost()); setIsNew(true) }} />
      <div className="space-y-3">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-4 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-sm text-gray-900">{post.title || <span className="text-gray-400 italic">Chưa có tiêu đề</span>}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${post.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {post.published ? '✓ Đã đăng' : '● Nháp'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{post.excerpt}</p>
              <div className="flex gap-3 text-xs text-gray-400 mt-1">
                <span>{post.date}</span>
                <span>#{post.category}</span>
              </div>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={() => toggle(post)} className={`text-xs px-3 py-1.5 rounded-lg ${post.published ? 'bg-gray-100 text-gray-600' : 'bg-green-50 text-green-700'}`}>
                {post.published ? 'Ẩn' : 'Đăng'}
              </button>
              <button onClick={() => { setEditing(post); setIsNew(false) }} className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg">Sửa</button>
              <button onClick={() => del(post.id)} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg">Xoá</button>
            </div>
          </div>
        ))}
      </div>
      {editing && <BlogEditModal post={editing} saving={saving} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  )
}

// ── STORES ────────────────────────────────────────────────────────────────────
interface Store { id: string; name: string; address: string; phone: string; hours: string; mapUrl: string; image: string; published: boolean }

function StoresSection() {
  const [stores, setStores] = useState<Store[]>([])
  const [editing, setEditing] = useState<Store | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/content/stores', { headers: { 'x-admin-token': PASSWORD } })
      .then(r => r.json()).then(d => setStores(Array.isArray(d) ? d : []))
  }, [])

  async function save(item: Record<string, any>) {
    setSaving(true)
    const storeItem = item as Store
    const next = isNew ? [...stores, storeItem] : stores.map(s => s.id === storeItem.id ? storeItem : s)
    await fetch('/api/admin/content/stores', {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': PASSWORD },
      body: JSON.stringify(next)
    })
    setStores(next); setSaving(false); setEditing(null)
  }

  async function del(id: string) {
    if (!confirm('Xoá cửa hàng này?')) return
    const next = stores.filter(s => s.id !== id)
    await fetch('/api/admin/content/stores', {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': PASSWORD },
      body: JSON.stringify(next)
    })
    setStores(next)
  }

  return (
    <div>
      <SectionHeader title="🏪 Hệ Thống Cửa Hàng" subtitle={`${stores.length} cửa hàng`}
        onAdd={() => { setEditing({ id: `store-${Date.now()}`, name: '', address: '', phone: '', hours: '', mapUrl: '', image: '', published: true }); setIsNew(true) }} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stores.map(store => (
          <div key={store.id} className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-bold text-sm text-gray-900">{store.name}</p>
                <p className="text-xs text-gray-500 mt-1">📍 {store.address}</p>
                <p className="text-xs text-gray-500">📞 {store.phone}</p>
                <p className="text-xs text-gray-500">🕐 {store.hours}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <button onClick={() => { setEditing(store); setIsNew(false) }} className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg">Sửa</button>
                <button onClick={() => del(store.id)} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg">Xoá</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {editing && <SimpleItemModal item={editing} saving={saving} title="Cửa Hàng"
        fields={[
          { key: 'name', label: 'Tên cửa hàng', type: 'text' },
          { key: 'address', label: 'Địa chỉ', type: 'text' },
          { key: 'phone', label: 'Số điện thoại', type: 'text' },
          { key: 'hours', label: 'Giờ mở cửa', type: 'text' },
          { key: 'mapUrl', label: 'Link Google Maps (tuỳ chọn)', type: 'text' },
          { key: 'image', label: 'URL ảnh cửa hàng (tuỳ chọn)', type: 'text' },
        ]}
        onSave={save} onClose={() => setEditing(null)} />}
    </div>
  )
}

// ── POLICIES ──────────────────────────────────────────────────────────────────
interface Policy { id: string; title: string; icon: string; content: string }

function PoliciesSection() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [editing, setEditing] = useState<Policy | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/content/policies', { headers: { 'x-admin-token': PASSWORD } })
      .then(r => r.json()).then(d => setPolicies(Array.isArray(d) ? d : []))
  }, [])

  async function save(item: Record<string, any>) {
    setSaving(true)
    const policyItem = item as Policy
    const next = isNew ? [...policies, policyItem] : policies.map(p => p.id === policyItem.id ? policyItem : p)
    await fetch('/api/admin/content/policies', {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': PASSWORD },
      body: JSON.stringify(next)
    })
    setPolicies(next); setSaving(false); setEditing(null)
  }

  async function del(id: string) {
    if (!confirm('Xoá chính sách này?')) return
    const next = policies.filter(p => p.id !== id)
    await fetch('/api/admin/content/policies', {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': PASSWORD },
      body: JSON.stringify(next)
    })
    setPolicies(next)
  }

  return (
    <div>
      <SectionHeader title="🛡️ Chính Sách Bảo Hành" subtitle={`${policies.length} mục chính sách`}
        onAdd={() => { setEditing({ id: `policy-${Date.now()}`, title: '', icon: '📋', content: '' }); setIsNew(true) }} />
      <div className="space-y-3">
        {policies.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-4">
            <span className="text-2xl flex-shrink-0">{p.icon}</span>
            <div className="flex-1">
              <p className="font-bold text-sm text-gray-900">{p.title}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{p.content}</p>
            </div>
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <button onClick={() => { setEditing(p); setIsNew(false) }} className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-lg">Sửa</button>
              <button onClick={() => del(p.id)} className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg">Xoá</button>
            </div>
          </div>
        ))}
      </div>
      {editing && <SimpleItemModal item={editing} saving={saving} title="Chính Sách"
        fields={[
          { key: 'icon', label: 'Icon (emoji)', type: 'text' },
          { key: 'title', label: 'Tiêu đề', type: 'text' },
          { key: 'content', label: 'Nội dung chi tiết', type: 'textarea' },
        ]}
        onSave={save} onClose={() => setEditing(null)} />}
    </div>
  )
}

// ── GENERIC MODAL ─────────────────────────────────────────────────────────────
interface FieldDef { key: string; label: string; type: 'text' | 'number' | 'textarea'; isArray?: boolean }

function SimpleItemModal({ item, saving, title, fields, onSave, onClose }: {
  item: Record<string, any>; saving: boolean; title: string
  fields: FieldDef[]; onSave: (item: Record<string, any>) => void; onClose: () => void
}) {
  const [form, setForm] = useState<Record<string, any>>({ ...item })

  function getVal(key: string, isArray?: boolean) {
    const v = form[key]
    if (isArray && Array.isArray(v)) return v.join('\n')
    return String(v ?? '')
  }

  function setVal(key: string, val: string, isArray?: boolean) {
    setForm(f => ({ ...f, [key]: isArray ? val.split('\n').filter(Boolean) : val }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <p className="font-black text-gray-900">{title}</p>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea rows={4} value={getVal(f.key, f.isArray)}
                  onChange={e => setVal(f.key, e.target.value, f.isArray)}
                  className={inp('resize-none')} />
              ) : (
                <input type={f.type} value={getVal(f.key)}
                  onChange={e => setVal(f.key, e.target.value)}
                  className={inp()} />
              )}
            </div>
          ))}
        </div>
        <div className="px-5 py-4 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold">Huỷ</button>
          <SaveBtn saving={saving} onClick={() => onSave(form)} />
        </div>
      </div>
    </div>
  )
}

// ── BLOG EDIT MODAL ───────────────────────────────────────────────────────────
function BlogEditModal({ post, saving, onSave, onClose }: {
  post: { id: string; slug: string; title: string; excerpt: string; content: string; date: string; category: string; image: string; published: boolean }
  saving: boolean; onSave: (p: typeof post) => void; onClose: () => void
}) {
  const [form, setForm] = useState({ ...post })
  const f = (k: keyof typeof form) => (v: string | boolean) => setForm(x => ({ ...x, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <p className="font-black text-gray-900">Bài Viết Blog</p>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div><label className="block text-xs font-semibold text-gray-600 mb-1">Tiêu đề *</label>
            <input value={form.title} onChange={e => f('title')(e.target.value)} className={inp()} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Slug (URL)</label>
              <input value={form.slug} onChange={e => f('slug')(e.target.value)} className={inp()} placeholder="vd: cach-chon-gong-kinh" /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Ngày đăng</label>
              <input value={form.date} onChange={e => f('date')(e.target.value)} className={inp()} /></div>
          </div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1">Danh mục</label>
            <select value={form.category} onChange={e => f('category')(e.target.value)} className={inp()}>
              {['Kiến Thức', 'Thời Trang', 'Mẹo Hay', 'Sức Khỏe', 'Tin Tức'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select></div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1">Tóm tắt</label>
            <textarea rows={2} value={form.excerpt} onChange={e => f('excerpt')(e.target.value)} className={inp('resize-none')} /></div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1">Nội dung bài viết</label>
            <textarea rows={8} value={form.content} onChange={e => f('content')(e.target.value)} className={inp('resize-none')} placeholder="Viết nội dung bài viết đầy đủ tại đây..." /></div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1">URL ảnh đại diện</label>
            <input value={form.image} onChange={e => f('image')(e.target.value)} className={inp()} placeholder="https://..." /></div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={e => f('published')(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm font-semibold text-gray-700">Đăng công khai</span>
          </label>
        </div>
        <div className="px-5 py-4 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold">Huỷ</button>
          <SaveBtn saving={saving} onClick={() => onSave(form)} />
        </div>
      </div>
    </div>
  )
}

// ── PRODUCT EDIT MODAL ────────────────────────────────────────────────────────
function ProductEditModal({ product, onClose, onSaved }: { product: Product; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: product.name, sku: (product as { sku?: string }).sku ?? '', basePrice: product.basePrice, originalPrice: product.originalPrice ?? '', description: product.description, features: product.features.join('\n'), type: product.type, shape: product.shape, material: product.material, gender: product.gender, isBestSeller: product.isBestSeller ?? false, isNew: product.isNew ?? false })
  const [images, setImages] = useState<string[]>(product.images ?? [])
  const [colors, setColors] = useState(
    product.colorVariants.map(v => ({ id: v.id, name: v.name, hex: v.hex, isNew: false }))
  )
  const [specs, setSpecs] = useState({
    bridgeWidth: (product.specs as { bridgeWidth?: number })?.bridgeWidth ?? 18,
    lensWidth: (product.specs as { lensWidth?: number })?.lensWidth ?? 50,
    templeLength: (product.specs as { templeLength?: number })?.templeLength ?? 145,
    frameWidth: (product.specs as { frameWidth?: string })?.frameWidth ?? 'Vừa',
    weight: (product.specs as { weight?: number })?.weight ?? 20,
  })
  const [colorImages, setColorImages] = useState<Record<string, string[]>>(
    Object.fromEntries(product.colorVariants.map(v => [v.id, v.images ?? []]))
  )
  const [uploadingColor, setUploadingColor] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  function addColor() {
    const newId = `${product.id}-c${Date.now()}`
    setColors(c => [...c, { id: newId, name: '', hex: '#888888', isNew: true }])
    setColorImages(prev => ({ ...prev, [newId]: [] }))
  }

  async function handleUpload(file: File) {
    setUploading(true)
    const fd = new FormData(); fd.append('file', file); fd.append('productId', product.id)
    const r = await fetch('/api/admin/upload', { method: 'POST', headers: { 'x-admin-token': PASSWORD }, body: fd })
    const { url } = await r.json()
    setImages(p => [...p, url]); setUploading(false)
  }

  async function handleColorUpload(file: File, variantId: string) {
    setUploadingColor(variantId)
    const fd = new FormData(); fd.append('file', file); fd.append('productId', `${product.id}-${variantId}`)
    const r = await fetch('/api/admin/upload', { method: 'POST', headers: { 'x-admin-token': PASSWORD }, body: fd })
    const { url } = await r.json()
    setColorImages(prev => ({ ...prev, [variantId]: [...(prev[variantId] ?? []), url] }))
    setUploadingColor(null)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updatedVariants = colors.map(c => {
        const original = product.colorVariants.find(v => v.id === c.id)
        const imgs = colorImages[c.id] ?? []
        if (c.isNew || !original) {
          return {
            id: c.id, name: c.name, hex: c.hex,
            imageUrl: imgs[0] ?? images[0] ?? '',
            images: imgs, inStock: true,
            overlayImageUrl: `/images/overlays/${form.shape}-overlay.svg`,
          }
        }
        return {
          ...original, name: c.name, hex: c.hex,
          images: imgs.length ? imgs : (original.images ?? []),
          imageUrl: imgs[0] ?? original.imageUrl,
        }
      })

      // Cập nhật stock cho màu mới
      const newColors = colors.filter(c => c.isNew)
      if (newColors.length > 0) {
        const stockRes = await fetch('/api/admin/stock', { headers: { 'x-admin-token': PASSWORD } })
        const currentStock = await stockRes.json()
        newColors.forEach(c => { currentStock[c.id] = { inStock: true, quantity: 10 } })
        await fetch('/api/admin/stock', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-admin-token': PASSWORD },
          body: JSON.stringify(currentStock),
        })
      }

      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': PASSWORD },
        body: JSON.stringify({
          id: product.id,
          data: {
            ...form,
            basePrice: Number(form.basePrice),
            originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
            features: form.features.split('\n').filter(Boolean),
            images, colorVariants: updatedVariants, specs,
          }
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setSaving(false); onSaved()
    } catch (err) {
      setSaving(false)
      alert(`Lỗi khi lưu: ${err}. Vui lòng thử lại.`)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div><p className="font-black text-gray-900 text-sm">{product.name}</p><p className="text-xs text-gray-400">{product.id}</p></div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Tên sản phẩm</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp()} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Mã SP (SKU)</label>
              <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className={inp()} placeholder="VD: SP001" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Giá bán (đ)</label>
              <input type="number" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: +e.target.value }))} className={inp()} /></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Giá gốc (đ)</label>
              <input type="number" value={form.originalPrice} onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))} className={inp()} /></div>
          </div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1">Mô tả</label>
            <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inp('resize-none')} /></div>
          <div><label className="block text-xs font-semibold text-gray-600 mb-1">Đặc điểm (mỗi dòng 1 đặc điểm)</label>
            <textarea rows={3} value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} className={inp('resize-none')} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Loại gọng</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Product['type'] }))} className={inp()}>
                <option value="full-rim">Full Viền</option><option value="rimless">Không Viền</option><option value="semi-rimless">Nửa Viền</option>
              </select></div>
            <div><label className="block text-xs font-semibold text-gray-600 mb-1">Hình dáng</label>
              <select value={form.shape} onChange={e => setForm(f => ({ ...f, shape: e.target.value as Product['shape'] }))} className={inp()}>
                <option value="round">Mắt Tròn</option>
                <option value="square">Mắt Vuông</option>
                <option value="rectangle">Chữ Nhật</option>
                <option value="cat-eye">Mắt Mèo</option>
                <option value="oval">Oval</option>
                <option value="geometric">Đa Giác</option>
              </select></div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isBestSeller} onChange={e => setForm(f => ({ ...f, isBestSeller: e.target.checked }))} /><span className="text-sm">🏆 Bán Chạy</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isNew} onChange={e => setForm(f => ({ ...f, isNew: e.target.checked }))} /><span className="text-sm">✨ Hàng Mới</span></label>
          </div>

          {/* Thông số kỹ thuật */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
              <p className="text-xs font-bold text-gray-700">📐 Thông Số Kỹ Thuật</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Rộng mắt kính (mm)</label>
                <input type="number" value={specs.lensWidth} onChange={e => setSpecs(s => ({ ...s, lensWidth: +e.target.value }))} className={inp()} /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Rộng cầu mũi (mm)</label>
                <input type="number" value={specs.bridgeWidth} onChange={e => setSpecs(s => ({ ...s, bridgeWidth: +e.target.value }))} className={inp()} /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Dài gọng (mm)</label>
                <input type="number" value={specs.templeLength} onChange={e => setSpecs(s => ({ ...s, templeLength: +e.target.value }))} className={inp()} /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Trọng lượng (g)</label>
                <input type="number" value={specs.weight} onChange={e => setSpecs(s => ({ ...s, weight: +e.target.value }))} className={inp()} /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Độ rộng gọng</label>
                <select value={specs.frameWidth} onChange={e => setSpecs(s => ({ ...s, frameWidth: e.target.value }))} className={inp()}>
                  <option value="Hẹp">Hẹp</option>
                  <option value="Vừa">Vừa</option>
                  <option value="Rộng">Rộng</option>
                </select></div>
            </div>
          </div>

          {/* Màu sắc — chỉnh sửa & thêm mới */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-700">🎨 Màu Sắc</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Chỉnh sửa tên, mã màu hoặc thêm màu mới</p>
              </div>
              <button onClick={addColor} className="text-xs text-blue-600 font-bold hover:underline">+ Thêm màu</button>
            </div>
            <div className="p-4 space-y-2">
              {colors.map((c, i) => (
                <div key={c.id} className="flex items-center gap-2">
                  <input type="color" value={c.hex}
                    onChange={e => setColors(prev => prev.map((x, j) => j === i ? { ...x, hex: e.target.value } : x))}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-gray-300 p-0.5 flex-shrink-0" />
                  <input value={c.name} placeholder="Tên màu (VD: Đen Bóng)"
                    onChange={e => setColors(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                    className={inp('flex-1')} />
                  {c.isNew && <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded flex-shrink-0">Mới</span>}
                  {colors.length > 1 && (
                    <button onClick={() => {
                      setColors(prev => prev.filter((_, j) => j !== i))
                      setColorImages(prev => { const n = { ...prev }; delete n[c.id]; return n })
                    }} className="text-red-400 hover:text-red-600 flex-shrink-0">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Ảnh chung (ảnh đại diện) */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Ảnh đại diện sản phẩm</label>
            <label className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-xl py-3 cursor-pointer ${uploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-500'}`}>
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
              {uploading ? <span className="text-sm text-blue-600">⏳ Đang tải...</span> : <span className="text-sm text-gray-600">📷 Tải ảnh lên</span>}
            </label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {images.map((url, i) => (
                <div key={url} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <Image src={url} alt="" fill className="object-cover" unoptimized sizes="80px" />
                  <button onClick={() => setImages(p => p.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center">✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Ảnh theo từng màu */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
              <p className="text-xs font-bold text-gray-700">🎨 Ảnh mô tả theo từng màu sắc</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Khách chọn màu nào → gallery hiển thị ảnh của màu đó</p>
            </div>
            <div className="p-4 space-y-5">
              {colors.map(v => (
                <div key={v.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: v.hex }}/>
                    <span className="text-sm font-semibold text-gray-800">{v.name || <span className="text-gray-400 italic">Chưa đặt tên</span>}</span>
                    <span className="text-xs text-gray-400">({(colorImages[v.id] ?? []).length} ảnh)</span>
                  </div>

                  {/* Upload + preview */}
                  <div className="grid grid-cols-6 gap-2">
                    {/* Nút upload */}
                    <label className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer text-center transition-colors ${uploadingColor === v.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-400 bg-gray-50'}`}>
                      <input type="file" accept="image/*" multiple className="hidden"
                        onChange={e => Array.from(e.target.files ?? []).forEach(f => handleColorUpload(f, v.id))} />
                      {uploadingColor === v.id
                        ? <span className="text-xs text-blue-500">⏳</span>
                        : <><span className="text-lg">+</span><span className="text-[10px] text-gray-400 leading-tight">Thêm ảnh</span></>
                      }
                    </label>

                    {/* Ảnh đã upload */}
                    {(colorImages[v.id] ?? []).map((url, i) => (
                      <div key={url} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                        <Image src={url} alt="" fill className="object-cover" unoptimized sizes="80px"/>
                        {i === 0 && <span className="absolute bottom-0 left-0 right-0 text-[9px] bg-yellow-400 text-yellow-900 font-bold text-center py-0.5">Chính</span>}
                        <button onClick={() => setColorImages(prev => ({ ...prev, [v.id]: prev[v.id].filter((_, idx) => idx !== i) }))}
                          className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] opacity-0 group-hover:opacity-100 flex items-center justify-center">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 py-4 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold">Huỷ</button>
          <SaveBtn saving={saving} onClick={handleSave} />
        </div>
      </div>
    </div>
  )
}
