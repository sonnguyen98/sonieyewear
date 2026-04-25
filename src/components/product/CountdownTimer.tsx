'use client'

import { useState, useEffect } from 'react'

const INITIAL_SECONDS = 30 * 60

export default function CountdownTimer() {
  const [seconds, setSeconds] = useState(INITIAL_SECONDS)

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
  const secs = (seconds % 60).toString().padStart(2, '0')
  const isUrgent = seconds < 5 * 60

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
