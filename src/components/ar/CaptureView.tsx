'use client'

import { useRef, useEffect, useState } from 'react'

interface CaptureViewProps {
  onCapture: (dataUrl: string) => void
}

type CameraState = 'loading' | 'ready' | 'error' | 'no-https' | 'denied'

export default function CaptureView({ onCapture }: CaptureViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [state, setState] = useState<CameraState>('loading')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // iOS Safari chỉ cho phép camera qua HTTPS
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setState('no-https')
      return
    }

    let stream: MediaStream
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
    })
      .then(s => {
        stream = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
          videoRef.current.onloadedmetadata = () => setState('ready')
        }
      })
      .catch(err => {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setState('denied')
        } else {
          setState('error')
          setErrorMsg(err.message || 'Không thể mở camera')
        }
      })
    return () => { stream?.getTracks().forEach(t => t.stop()) }
  }, [])

  function capture() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')!
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)
    onCapture(canvas.toDataURL('image/jpeg', 0.92))
  }

  function startCountdown() {
    setCountdown(3)
    let c = 3
    const t = setInterval(() => {
      c--
      if (c <= 0) { clearInterval(t); setCountdown(null); capture() }
      else setCountdown(c)
    }, 1000)
  }

  // ── Lỗi HTTPS (iOS Safari, HTTP) ──────────────────────────────────────────
  if (state === 'no-https') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center bg-white gap-5">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-3xl">🔒</div>
        <div>
          <p className="text-xl font-black text-gray-900 mb-2">Cần kết nối HTTPS</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Trình duyệt Safari trên iPhone yêu cầu kết nối <strong>HTTPS</strong> để truy cập camera.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 text-left w-full max-w-sm">
          <p className="text-xs font-bold text-blue-800 mb-2">Cách khắc phục:</p>
          <ol className="text-xs text-blue-700 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>Truy cập website qua địa chỉ <strong>https://</strong> thay vì http://</li>
            <li>Hoặc thử bằng trình duyệt <strong>Chrome trên Android</strong></li>
            <li>Hoặc nhờ admin deploy lên domain có SSL</li>
          </ol>
        </div>
        <p className="text-xs text-gray-400">Đây là giới hạn bảo mật của iOS Safari, không phải lỗi ứng dụng.</p>
      </div>
    )
  }

  // ── Bị từ chối quyền camera ───────────────────────────────────────────────
  if (state === 'denied') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center bg-white gap-5">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl">📵</div>
        <div>
          <p className="text-xl font-black text-gray-900 mb-2">Chưa cấp quyền camera</p>
          <p className="text-sm text-gray-500 leading-relaxed">Bạn cần cho phép truy cập camera để sử dụng tính năng này.</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-left w-full max-w-sm">
          <p className="text-xs font-bold text-gray-700 mb-2">Cách bật quyền camera:</p>
          <ol className="text-xs text-gray-600 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>Vào <strong>Cài đặt</strong> điện thoại</li>
            <li>Tìm <strong>Safari / Chrome</strong> → Camera</li>
            <li>Chọn <strong>"Cho phép"</strong> rồi tải lại trang</li>
          </ol>
        </div>
        <button onClick={() => window.location.reload()}
          className="bg-brand-zalo text-white font-bold px-6 py-3 rounded-full text-sm">
          Tải lại trang
        </button>
      </div>
    )
  }

  // ── Lỗi khác ──────────────────────────────────────────────────────────────
  if (state === 'error') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center bg-white gap-4">
        <div className="text-4xl">⚠️</div>
        <p className="text-lg font-black text-gray-900">Không thể mở camera</p>
        <p className="text-sm text-gray-500">{errorMsg}</p>
        <button onClick={() => window.location.reload()}
          className="bg-gray-900 text-white font-bold px-6 py-3 rounded-full text-sm">
          Thử lại
        </button>
      </div>
    )
  }

  // ── Camera bình thường ────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <video ref={videoRef} autoPlay playsInline muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />

      {/* Face guide oval */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" preserveAspectRatio="xMidYMid meet" viewBox="0 0 100 100">
          <defs>
            <mask id="faceMask">
              <rect width="100" height="100" fill="white"/>
              <ellipse cx="50" cy="46" rx="28" ry="37" fill="black"/>
            </mask>
          </defs>
          <rect width="100" height="100" fill="rgba(0,0,0,0.5)" mask="url(#faceMask)"/>
          <ellipse cx="50" cy="46" rx="28" ry="37"
            fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="3 1.5" opacity="0.9"/>
          <line x1="22" y1="15" x2="28" y2="15" stroke="white" strokeWidth="0.8" strokeLinecap="round"/>
          <line x1="22" y1="15" x2="22" y2="21" stroke="white" strokeWidth="0.8" strokeLinecap="round"/>
          <line x1="78" y1="15" x2="72" y2="15" stroke="white" strokeWidth="0.8" strokeLinecap="round"/>
          <line x1="78" y1="15" x2="78" y2="21" stroke="white" strokeWidth="0.8" strokeLinecap="round"/>
          <line x1="22" y1="77" x2="28" y2="77" stroke="white" strokeWidth="0.8" strokeLinecap="round"/>
          <line x1="22" y1="77" x2="22" y2="71" stroke="white" strokeWidth="0.8" strokeLinecap="round"/>
          <line x1="78" y1="77" x2="72" y2="77" stroke="white" strokeWidth="0.8" strokeLinecap="round"/>
          <line x1="78" y1="77" x2="78" y2="71" stroke="white" strokeWidth="0.8" strokeLinecap="round"/>
        </svg>
      </div>

      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-black text-8xl drop-shadow-2xl animate-ping" style={{ animationDuration: '0.9s' }}>
            {countdown}
          </span>
        </div>
      )}

      {state === 'ready' && countdown === null && (
        <div className="absolute top-1/4 left-0 right-0 text-center">
          <p className="text-white text-sm font-semibold drop-shadow bg-black/30 mx-auto inline-block px-4 py-1.5 rounded-full">
            Căn khuôn mặt vào khung oval
          </p>
        </div>
      )}

      <div className="absolute bottom-10 left-0 right-0 flex justify-center">
        {state === 'ready' ? (
          <button onClick={startCountdown} disabled={countdown !== null}
            className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white border-2 border-gray-400"/>
          </button>
        ) : (
          <div className="text-white text-sm flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
            Đang mở camera...
          </div>
        )}
      </div>
    </div>
  )
}
