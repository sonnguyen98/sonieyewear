'use client'

import { useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import CaptureView from '@/components/ar/CaptureView'
import { getFaceLandmarkerForImage } from '@/lib/mediapipe'
import { analyzeFaceShape, getRecommendedFrameShapes } from '@/lib/faceShapeAnalysis'
import type { FaceAnalysisResult } from '@/lib/faceShapeAnalysis'
import type { FaceLandmarkPoint } from '@/types/ar'
import { MERGED_PRODUCTS } from '@/data/products'
import { openZaloDefault } from '@/lib/zalo'

const VirtualTryOn3D = dynamic(() => import('@/components/ar/VirtualTryOn3D'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin"/>
    </div>
  ),
})

const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

type Step = 'intro' | 'live-tryon' | 'capture' | 'analyzing' | 'result'

function ThuKinhContent() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('intro')
  const [analysis, setAnalysis] = useState<FaceAnalysisResult | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [recommended, setRecommended] = useState<typeof MERGED_PRODUCTS>([])
  const [aiSource, setAiSource] = useState<'gemini' | 'mediapipe'>('mediapipe')

  async function handleCapture(dataUrl: string) {
    setPhotoUrl(dataUrl)
    setStep('analyzing')

    try {
      let result: import('@/lib/faceShapeAnalysis').FaceAnalysisResult | null = null

      // Thử Gemini AI trước — log chi tiết để debug
      try {
        const res = await fetch('/api/analyze-face', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: dataUrl }),
        })
        const data = await res.json().catch(() => ({}))
        if (res.ok && data.success && data.result) {
          const g = data.result
          result = {
            shape: g.shape,
            shapeName: g.shapeName || g.shape,
            confidence: g.confidence || 0.85,
            description: g.description || '',
            features: g.features || [],
            recommendedShapes: g.recommendedShapes || [],
            avoidShapes: [],
            tip: g.tip || '',
          }
          setAiSource('gemini')
          console.log('✅ Gemini phân tích thành công:', g.shape)
        } else {
          // KHÔNG silent — log rõ để user biết Gemini fail vì lý do gì
          console.error('❌ Gemini API fail:', {
            status: res.status,
            code: data?.code,
            error: data?.error,
            detail: data?.detail,
          })
        }
      } catch (geminiErr) {
        console.error('❌ Network error khi gọi /api/analyze-face:', geminiErr)
      }

      // Reset badge nếu Gemini fail (tránh hiển thị "Gemini" từ lần trước)
      if (!result) setAiSource('mediapipe')

      // Fallback: MediaPipe nếu Gemini lỗi
      if (!result) {
        const img = new window.Image()
        img.src = dataUrl
        await new Promise(r => { img.onload = r })
        const lm = await getFaceLandmarkerForImage()
        const results = lm.detect(img)
        if (!results.faceLandmarks?.[0]) {
          setStep('capture')
          alert('Không nhận diện được khuôn mặt. Vui lòng chụp lại ảnh rõ hơn, đủ ánh sáng.')
          return
        }
        const landmarks = results.faceLandmarks[0] as FaceLandmarkPoint[]
        result = analyzeFaceShape(landmarks, img.naturalWidth, img.naturalHeight)
      }

      setAnalysis(result)

      // Fetch sản phẩm phù hợp
      let allProducts = MERGED_PRODUCTS
      try {
        const pr = await fetch('/api/products')
        const d = await pr.json()
        if (Array.isArray(d) && d.length > 0) allProducts = d
      } catch {}

      const rShapes = result.recommendedShapes
      const filtered = allProducts.filter(p => rShapes.includes(p.shape)).slice(0, 5)
      setRecommended(filtered.length >= 2 ? filtered : allProducts.slice(0, 5))
      setStep('result')

    } catch (e) {
      console.error(e)
      setStep('capture')
      alert('Có lỗi xảy ra. Vui lòng thử lại.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── LIVE TRY-ON 3D ── */}
      {step === 'live-tryon' && (
        <VirtualTryOn3D onClose={() => setStep('intro')} />
      )}

      {/* ── INTRO ── */}
      {step === 'intro' && (
        <div className="max-w-lg mx-auto px-4 py-12 text-center">
          <div className="w-20 h-20 bg-brand-zalo/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-brand-zalo" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-brand-black mb-3">
            Tư Vấn Gọng Kính<br/>
            <span className="text-brand-zalo">Phù Hợp Khuôn Mặt</span>
          </h1>
          <p className="text-brand-muted mb-8 leading-relaxed">
            Chụp ảnh khuôn mặt — AI sẽ phân tích hình dạng và đề xuất<br/>
            <strong className="text-brand-black">3–5 mẫu gọng phù hợp nhất</strong> chỉ trong vài giây.
          </p>

          {/* Các bước */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { icon: '📸', title: 'Chụp ảnh', desc: 'Chụp ảnh khuôn mặt trực diện' },
              { icon: '🧠', title: 'Phân tích', desc: 'AI nhận diện hình dáng mặt' },
              { icon: '✨', title: 'Đề xuất', desc: 'Nhận gợi ý gọng phù hợp nhất' },
            ].map(s => (
              <div key={s.title} className="bg-white rounded-2xl p-3 shadow-sm text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <p className="text-xs font-bold text-brand-black">{s.title}</p>
                <p className="text-[11px] text-brand-muted mt-0.5 leading-tight">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA chính: thử kính 3D trực tiếp */}
          <button onClick={() => setStep('live-tryon')}
            className="w-full bg-brand-black hover:bg-gray-800 text-white font-bold py-4 rounded-2xl text-base shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <circle cx="6" cy="12" r="4"/><circle cx="18" cy="12" r="4"/>
              <path strokeLinecap="round" d="M10 12h4M2 12h0M22 12h0"/>
            </svg>
            Thử Kính Trực Tiếp (3D)
          </button>

          {/* Phân tích khuôn mặt AI */}
          <button onClick={() => setStep('capture')}
            className="w-full bg-brand-zalo hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-base shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Phân Tích Khuôn Mặt (AI)
          </button>

          <p className="text-xs text-brand-muted mt-4">
            🔒 Ảnh không được lưu trữ — chỉ dùng để phân tích tức thời
          </p>

          <Link href="/gong-kinh" className="mt-4 inline-block text-sm text-brand-zalo hover:underline">
            Xem tất cả gọng kính →
          </Link>
        </div>
      )}

      {/* ── CAPTURE ── */}
      {step === 'capture' && (
        <div className="fixed inset-0 bg-black flex flex-col">
          <div className="absolute top-4 left-4 z-20">
            <button onClick={() => setStep('intro')}
              className="flex items-center gap-1.5 text-white bg-black/40 backdrop-blur px-3 py-2 rounded-full text-sm font-semibold">
              ← Quay lại
            </button>
          </div>
          <div className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur text-white text-xs px-3 py-2 rounded-full">
            📸 Nhìn thẳng vào camera
          </div>
          <CaptureView onCapture={handleCapture} />
        </div>
      )}

      {/* ── ANALYZING ── */}
      {step === 'analyzing' && (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-6 px-4">
          {photoUrl && (
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-brand-zalo shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoUrl} alt="face" className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-brand-zalo/20 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-brand-zalo border-t-transparent rounded-full animate-spin"/>
              </div>
            </div>
          )}
          <div className="text-center">
            <p className="text-xl font-black text-brand-black mb-2">Đang phân tích khuôn mặt...</p>
            <p className="text-sm text-brand-muted">AI đang xác định hình dạng và tìm gọng phù hợp nhất</p>
          </div>
          <div className="flex gap-2">
            {['Đo tỉ lệ khuôn mặt', 'Nhận diện hình dạng', 'Tìm gọng phù hợp'].map((t, i) => (
              <div key={t} className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}>
                {t}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RESULT ── */}
      {step === 'result' && analysis && (
        <div className="max-w-2xl mx-auto px-4 py-6">

          {/* Kết quả phân tích — compact, không có confidence bar */}
          <div className="bg-gradient-to-r from-brand-zalo to-blue-500 rounded-2xl px-5 py-4 text-white mb-2 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs font-semibold opacity-80 mb-0.5">Khuôn mặt của bạn</p>
              <h2 className="text-2xl font-black leading-tight">{analysis.shapeName}</h2>
              <p className="text-xs opacity-80 mt-1 line-clamp-2">{analysis.description}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-3xl mb-1">
                {analysis.shape === 'oval' ? '🥚' : analysis.shape === 'round' ? '🔵' : analysis.shape === 'square' ? '⬛' : analysis.shape === 'heart' ? '🩷' : analysis.shape === 'rectangle' ? '▬' : '💎'}
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                {aiSource === 'gemini' ? '✨ Gemini AI' : '🔬 AI'}
              </span>
            </div>
          </div>

          {/* Phân tích cá nhân hoá — màu da + đối xứng + tỉ lệ */}
          {((analysis as {skinTone?: string}).skinTone || (analysis as {symmetry?: string}).symmetry) && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {(analysis as {skinTone?: string}).skinTone && (
                <div className="bg-white rounded-xl p-2.5 text-center border border-gray-100">
                  <p className="text-[10px] text-gray-400 mb-0.5">Tông da</p>
                  <p className="text-xs font-bold text-gray-800">
                    {(analysis as {skinTone?: string}).skinTone === 'ấm' ? '🟡 Tông Ấm' : (analysis as {skinTone?: string}).skinTone === 'lạnh' ? '🔵 Tông Lạnh' : '⚪ Trung Tính'}
                  </p>
                </div>
              )}
              {(analysis as {symmetry?: string}).symmetry && (
                <div className="bg-white rounded-xl p-2.5 text-center border border-gray-100">
                  <p className="text-[10px] text-gray-400 mb-0.5">Cân xứng</p>
                  <p className="text-xs font-bold text-gray-800">
                    {(analysis as {symmetry?: string}).symmetry === 'cân xứng' ? '✅ Cân xứng' : (analysis as {symmetry?: string}).symmetry === 'hơi lệch trái' ? '↙ Hơi lệch trái' : '↘ Hơi lệch phải'}
                  </p>
                </div>
              )}
              <div className="bg-white rounded-xl p-2.5 text-center border border-gray-100">
                <p className="text-[10px] text-gray-400 mb-0.5">Hình dạng</p>
                <p className="text-xs font-bold text-gray-800">{analysis.shapeName}</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 mb-2">
            {analysis.features.slice(0, 3).map(f => (
              <span key={f} className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                ✓ {f}
              </span>
            ))}
          </div>

          {/* Màu gọng phù hợp tông da */}
          {(analysis as {frameColorTip?: string}).frameColorTip && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-2.5 mb-2">
              <p className="text-xs text-purple-900 leading-relaxed"><strong>🎨 Màu gọng phù hợp:</strong> {(analysis as {frameColorTip?: string}).frameColorTip}</p>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-5">
            <p className="text-xs text-amber-800 leading-relaxed"><strong>💡 SONi gợi ý:</strong> {analysis.tip}</p>
          </div>

          {/* === SẢN PHẨM PHÙ HỢP — PHẦN QUAN TRỌNG NHẤT === */}
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="font-black text-brand-black text-lg">🎯 Gọng Kính Dành Cho Bạn</h3>
              <p className="text-xs text-brand-muted">AI chọn lọc {recommended.length} mẫu phù hợp nhất với khuôn mặt {analysis.shapeName}</p>
            </div>
            <button onClick={() => setStep('capture')}
              className="text-xs text-gray-500 hover:text-brand-black flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              Chụp lại
            </button>
          </div>

          {/* Grid 2 cột — ảnh to, CTA ngay dưới */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {recommended.map((product, idx) => {
              const thumb = product.images?.[0] ?? product.colorVariants[0]?.imageUrl
              const discounted = Math.round(product.basePrice * 0.8)
              return (
                <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                  {/* Badge top */}
                  {idx === 0 && (
                    <div className="bg-amber-400 text-amber-900 text-[10px] font-black text-center py-1">
                      ⭐ PHÙ HỢP NHẤT
                    </div>
                  )}
                  {/* Ảnh lớn */}
                  <Link href={`/gong-kinh/${product.id}`} className="block">
                    <div className="relative aspect-square bg-gray-50">
                      <Image src={thumb} alt={product.name} fill className="object-contain p-3" sizes="(max-width: 640px) 50vw, 300px"/>
                    </div>
                  </Link>
                  {/* Info */}
                  <div className="p-3 flex flex-col flex-1">
                    <p className="font-bold text-xs text-brand-black line-clamp-2 mb-1 leading-tight">{product.name}</p>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-sm font-black text-brand-black">{fmt(discounted)}</span>
                      <span className="text-[10px] text-red-500 font-bold">-20%</span>
                    </div>
                    {/* CTA mua hàng ngay */}
                    <Link href={`/gong-kinh/${product.id}`}
                      className="mt-auto w-full bg-brand-zalo hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl text-center transition-all active:scale-95 block">
                      Đặt Hàng Ngay
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          {/* CTA chính + Zalo */}
          <div className="space-y-2.5">
            <Link href={`/gong-kinh?shape=${analysis.recommendedShapes[0]}`}
              className="w-full bg-brand-zalo hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-base shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
              Xem Thêm Gọng Phù Hợp →
            </Link>
            <button onClick={openZaloDefault}
              className="w-full bg-white border-2 border-brand-zalo text-brand-zalo font-bold py-3 rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors active:scale-95">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm-3 7h6a1 1 0 110 2H9a1 1 0 110-2zm0 4h4a1 1 0 110 2H9a1 1 0 110-2z"/>
              </svg>
              Nhắn Zalo — Tư Vấn Miễn Phí
            </button>
          </div>

          <p className="text-center text-[11px] text-brand-muted mt-4">
            🛡️ Tư vấn miễn phí · Đổi trả 7 ngày · Giao toàn quốc
          </p>
        </div>
      )}
    </div>
  )
}

export default function ThuKinhPage() {
  return <Suspense><ThuKinhContent/></Suspense>
}
