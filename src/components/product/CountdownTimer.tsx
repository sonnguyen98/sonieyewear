'use client'

import { useState, useEffect } from 'react'

const INITIAL_SECONDS = 30 * 60
const STORAGE_KEY = 'soni_promo_deadline'

export default function CountdownTimer() {
  // Khởi tạo = 0 để tránh hydration mismatch (server không có localStorage).
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    // Lấy deadline đã lưu hoặc tạo mới = now + 30 phút.
    const now = Date.now()
    let deadline = Number(localStorage.getItem(STORAGE_KEY) || 0)
    if (!deadline || deadline <= now) {
      deadline = now + INITIAL_SECONDS * 1000
      localStorage.setItem(STORAGE_KEY, String(deadline))
    }

    const tick = () => {
      const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000))
      setSeconds(remaining)
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
  const secs = (seconds % 60).toString().padStart(2, '0')
  const isUrgent = seconds > 0 && seconds < 5 * 60

  return (
    <div className="flex items-center gap-1.5">
      <div className={`flex flex-col items-center px-2.5 py-1 rounded-lg ${isUrgent ? 'bg-red-600' : 'bg-brand-black'}`}>
        <span className="text-white font-black text-xl leading-none font-mono">{mins}</span>
        <span className="text-white/70 text-[9px] leading-none mt-0.5">phút</span>
      </div>
      <span className={`text-xl font-black ${isUrgent ? 'text-red-600' : 'text-brand-black'}`}>:</span>
      <div className={`flex flex-col items-center px-2.5 py-1 rounded-lg ${isUrgent ? 'bg-red-600' : 'bg-brand-black'}`}>
        <span className="text-white font-black text-xl leading-none font-mono">{secs}</span>
        <span className="text-white/70 text-[9px] leading-none mt-0.5">giây</span>
      </div>
    </div>
  )
}
