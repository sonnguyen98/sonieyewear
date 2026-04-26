'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import CaptureView from '@/components/ar/CaptureView'
import { getFaceLandmarkerForImage } from '@/lib/mediapipe'
import { analyzeFaceShape, getRecommendedFrameShapes } from '@/lib/faceShapeAnalysis'
import type { FaceAnalysisResult } from '@/lib/faceShapeAnalysis'
import type { FaceLandmarkPoint } from '@/types/ar'
import { MERGED_PRODUCTS } from '@/data/products'

const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)

type Step = 'intro' | 'capture' | 'analyzing' | 'result'

function ThuKinhContent() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('intro')
  const [analysis, setAnalysis] = useState<FaceAnalysisResult | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [recommended, setRecommended] = useState<typeof MERGED_PRODUCTS>([])

  async function handleCapture(dataUrl: string) {
    setPhotoUrl(dataUrl)
    setStep('analyzing')

    try {
      // Gọi Gemini AI để phân tích khuôn mặt
      const res = await fetch('/api/analyze-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUrl }),
      })

      if (!res.ok) throw new Error('API error')
      const data = await res.json()

      if (!data.success || !data.result) {
        throw new Error(data.error || 'Không phân tích được')
      }

      const geminiResult = data.result

      // Map kết quả Gemini sang FaceAnalysisResult
      const result: import('@/lib/faceShapeAnalysis').FaceAnalysisResult = {
        shape: geminiResult.shape as import('@/lib/faceShapeAnalysis').FaceShape,
        shapeName: geminiResult.shapeName || geminiResult.shape,
        confidence: geminiResult.confidence || 0.85,
        description: geminiResult.description || '',
        features: geminiResult.features || [],
        recommendedShapes: geminiResult.recommendedShapes || [],
        avoidShapes: [],
        tip: geminiResult.tip || '',
      }

      setAnalysis(result)

      // Fetch sản phẩm phù hợp từ KV
      const productsRes = await fetch('/api/products')
      const allProducts = await productsRes.json()
      const rShapes = result.recommendedShapes

      const filtered = Array.isArray(allProducts)
        ? allProducts.filter((p: { shape: string }) => rShapes.includes(p.shape)).slice(0, 5)
        : []

      setRecommended(
        filtered.length >= 2 ? filtered :
        Array.isArray(allProducts) ? allProducts.slice(0, 5) : MERGED_PRODUCTS.slice(0, 5)
      )

      setStep('result')
    } catch (e) {
      console.error(e)
      setStep('capture')
      alert('Không thể phân tích ảnh. Vui lòng thử lại hoặc kiểm tra kết nối mạng.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

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

          <button onClick={() => setStep('capture')}
            className="w-full bg-brand-zalo hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-base shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            Bắt Đầu Phân Tích
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

          {/* Kết quả phân tích */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-brand-zalo to-blue-500 px-6 py-5 text-white">
              <p className="text-xs font-semibold opacity-80 mb-1">Kết quả phân tích của bạn</p>
              <h2 className="text-2xl font-black">{analysis.shapeName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 bg-white/30 rounded-full flex-1">
                  <div className="h-full bg-white rounded-full" style={{ width: `${analysis.confidence * 100}%` }}/>
                </div>
                <span className="text-xs font-bold">{Math.round(analysis.confidence * 100)}% phù hợp</span>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm text-brand-muted leading-relaxed mb-4">{analysis.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {analysis.features.map(f => (
                  <span key={f} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100">
                    ✓ {f}
                  </span>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <p className="text-xs font-bold text-amber-800 mb-0.5">💡 Lời khuyên từ SONi</p>
                <p className="text-sm text-amber-700 leading-relaxed">{analysis.tip}</p>
              </div>
            </div>
          </div>

          {/* Sản phẩm đề xuất */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-black text-brand-black text-lg">Gọng Kính Phù Hợp Nhất</h3>
              <p className="text-xs text-brand-muted">{recommended.length} mẫu được chọn lọc cho bạn</p>
            </div>
            <button onClick={() => setStep('capture')}
              className="text-xs text-brand-zalo font-semibold border border-brand-zalo px-3 py-1.5 rounded-full">
              📸 Chụp lại
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {recommended.map((product, idx) => {
              const thumb = product.images?.[0] ?? product.colorVariants[0]?.imageUrl
              const discounted = Math.round(product.basePrice * 0.8)
              return (
                <Link key={product.id} href={`/gong-kinh/${product.slug}`}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 p-3 hover:shadow-md hover:border-brand-zalo transition-all">
                  {/* Rank */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${idx === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-100 text-gray-500'}`}>
                    {idx === 0 ? '⭐' : idx + 1}
                  </div>

                  {/* Ảnh */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                    <Image src={thumb} alt={product.name} fill className="object-contain" unoptimized sizes="64px"/>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-brand-black line-clamp-1">{product.name}</p>
                    <p className="text-xs text-brand-muted mt-0.5">
                      {product.material === 'metal' ? 'Kim Loại' : product.material === 'plastic' ? 'Nhựa' : product.material === 'titanium' ? 'Titanium' : 'Kết Hợp'}
                      {' · '}
                      {product.shape === 'round' ? 'Mắt Tròn' : product.shape === 'square' ? 'Mắt Vuông' : product.shape === 'rectangle' ? 'Chữ Nhật' : product.shape === 'cat-eye' ? 'Mắt Mèo' : product.shape === 'oval' ? 'Oval' : 'Đa Giác'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-black text-brand-black">{fmt(discounted)}</span>
                      {product.originalPrice && <span className="text-xs text-gray-400 line-through">{fmt(product.basePrice)}</span>}
                      <span className="text-xs text-green-600 font-semibold">-20%</span>
                    </div>
                  </div>

                  <svg className="w-4 h-4 text-gray-300 group-hover:text-brand-zalo flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </Link>
              )
            })}
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Link href={`/gong-kinh?shape=${analysis.recommendedShapes[0]}`}
              className="w-full bg-brand-zalo hover:bg-blue-700 text-white font-bold py-4 rounded-2xl text-base shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
              Xem Tất Cả Gọng Phù Hợp →
            </Link>
            <Link href="/gong-kinh"
              className="w-full bg-white border-2 border-gray-200 text-brand-black font-semibold py-3 rounded-2xl text-sm text-center block hover:border-gray-400 transition-colors">
              Xem Toàn Bộ Bộ Sưu Tập
            </Link>
          </div>

          <p className="text-center text-xs text-brand-muted mt-6">
            Cần tư vấn thêm? <button onClick={() => {}} className="text-brand-zalo font-semibold underline">Nhắn Zalo ngay</button>
          </p>
        </div>
      )}
    </div>
  )
}

export default function ThuKinhPage() {
  return <Suspense><ThuKinhContent/></Suspense>
}
