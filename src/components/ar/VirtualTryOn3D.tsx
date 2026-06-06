'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { buildZaloOrderMessage, openZalo } from '@/lib/zalo'
import { MERGED_PRODUCTS } from '@/data/products'
import type { Product } from '@/types/product'

type EngineModule = typeof import('@/lib/tryon/engine')

const LOADING_STEPS = [
  { key: 'camera', label: 'Truy cập camera' },
  { key: 'scene',  label: 'Thiết lập cảnh 3D' },
  { key: 'engine', label: 'Tải mô hình AI' },
]

interface VirtualTryOn3DProps {
  onClose: () => void
  initialProductId?: string | null
}

export default function VirtualTryOn3D({ onClose, initialProductId }: VirtualTryOn3DProps) {
  const [loadingStep, setLoadingStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedId, setSelectedId] = useState<string>(
    initialProductId ?? MERGED_PRODUCTS[0]?.id ?? ''
  )

  const videoRef   = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const streamRef  = useRef<MediaStream | null>(null)
  const engineRef  = useRef<EngineModule | null>(null)

  const products: Product[] = MERGED_PRODUCTS.slice(0, 12)

  const overlayUrl = useCallback((product: Product) => {
    const shape = product.shape
    return `/images/overlays/${shape}-overlay.svg`
  }, [])

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const video = videoRef.current
        const container = containerRef.current
        if (!video || !container) return

        // Step 0: Camera
        setLoadingStep(0)
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        })
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        video.srcObject = stream

        await new Promise<void>(res => {
          video.oncanplay = () => { video.play(); res() }
        })
        if (!mounted) return

        // Step 1: 3D scene
        setLoadingStep(1)
        const engine = await import('@/lib/tryon/engine')
        if (!mounted) return
        engineRef.current = engine

        const currentProduct = MERGED_PRODUCTS.find(p => p.id === selectedId)
        const imageUrl = overlayUrl(currentProduct ?? MERGED_PRODUCTS[0])
        engine.initializeThreejs(imageUrl, video, container)

        // Step 2: AI model
        setLoadingStep(2)
        await engine.initializeEngine()
        if (!mounted) return

        setIsFadingOut(true)
        setTimeout(() => { if (mounted) setIsLoading(false) }, 500)
      } catch (err) {
        if (!mounted) return
        console.error('VirtualTryOn3D init error:', err)
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('Permission') || msg.includes('NotAllowed')) {
          setError('Vui lòng cho phép truy cập camera để sử dụng tính năng này.')
        } else {
          setError('Không thể khởi động. Vui lòng thử lại.')
        }
        setIsLoading(false)
      }
    }

    init()

    return () => {
      mounted = false
      streamRef.current?.getTracks().forEach(t => t.stop())
      engineRef.current?.destroyEngine()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelect = useCallback((product: Product) => {
    setSelectedId(product.id)
    const url = overlayUrl(product)
    engineRef.current?.setGlassesImage(url)
  }, [overlayUrl])

  const handleScreenshot = useCallback(() => {
    const canvas = containerRef.current?.querySelector('canvas') as HTMLCanvasElement | null
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `soni-kính-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [])

  const handleOrder = useCallback(() => {
    const product = MERGED_PRODUCTS.find(p => p.id === selectedId)
    if (!product) return
    const color = product.colorVariants[0]
    const lens  = product.lensPackages[0]
    openZalo(buildZaloOrderMessage(product, color, lens))
  }, [selectedId])

  const selectedProduct = MERGED_PRODUCTS.find(p => p.id === selectedId)

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden">

      {/* ── Loading overlay ── */}
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 bg-black z-40 flex flex-col items-center justify-center gap-8 transition-opacity duration-500',
            isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="12" r="4"/><circle cx="18" cy="12" r="4"/>
              <path d="M10 12h4M2 12h0M22 12h0"/>
            </svg>
            <p className="text-white/40 text-xs font-semibold tracking-widest uppercase">SONi Virtual Try-On</p>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px]">
            {LOADING_STEPS.map((step, i) => {
              const done   = i < loadingStep
              const active = i === loadingStep
              return (
                <div key={step.key} className={cn('flex items-center gap-3 text-sm transition-colors', done ? 'text-green-400' : active ? 'text-white' : 'text-white/30')}>
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {done ? (
                      <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <polyline points="2,5.5 4.5,8 8,2.5"/>
                      </svg>
                    ) : active ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white/30"/>
                    )}
                  </div>
                  {step.label}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Error state ── */}
      {error && !isLoading && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
          </svg>
          <p className="text-white text-sm font-semibold">{error}</p>
          <button onClick={onClose} className="text-white/60 text-xs underline">Quay lại</button>
        </div>
      )}

      {/* ── Three.js container + hidden video ── */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden [&_canvas]:w-full [&_canvas]:h-full [&_canvas]:object-cover"
      >
        <video
          ref={videoRef}
          className="hidden"
          autoPlay
          playsInline
          muted
        />
      </div>

      {/* ── Top bar ── */}
      {!isLoading && !error && (
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-30 pointer-events-none">
          <button
            onClick={onClose}
            className="pointer-events-auto flex items-center gap-1.5 bg-black/50 backdrop-blur text-white text-xs font-semibold px-3 py-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            Quay lại
          </button>

          <button
            onClick={handleScreenshot}
            className="pointer-events-auto flex items-center gap-1.5 bg-black/50 backdrop-blur text-white text-xs font-semibold px-3 py-2 rounded-full hover:bg-black/70 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
            Chụp
          </button>
        </div>
      )}

      {/* ── Bottom: product strip + order CTA ── */}
      {!isLoading && !error && (
        <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-black/80 to-transparent pt-8">
          {/* CTA */}
          {selectedProduct && (
            <div className="px-4 pb-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold line-clamp-1">{selectedProduct.name}</p>
                <p className="text-white/60 text-xs">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.basePrice)}
                </p>
              </div>
              <button
                onClick={handleOrder}
                className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
              >
                Đặt hàng qua Zalo
              </button>
            </div>
          )}

          {/* Scrollable products strip */}
          <div className="flex gap-2 overflow-x-auto px-4 pb-6 scrollbar-none snap-x snap-mandatory">
            {products.map(p => {
              const isSelected = p.id === selectedId
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className={cn(
                    'flex-shrink-0 snap-start flex flex-col items-center gap-1 p-1.5 rounded-xl border-2 transition-all',
                    isSelected
                      ? 'border-white bg-white/20 scale-105'
                      : 'border-white/20 hover:border-white/50 bg-white/5'
                  )}
                >
                  <div className="w-16 h-12 relative rounded-lg overflow-hidden bg-white/10">
                    <Image
                      src={p.colorVariants[0]?.imageUrl}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <span className="text-white/80 text-[10px] font-medium leading-none max-w-[4rem] line-clamp-1 text-center">
                    {p.name.split(' ').slice(-1)[0]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
