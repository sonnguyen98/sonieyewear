'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function AffiliateTracker() {
  const searchParams = useSearchParams()
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref && ref.startsWith('SONI')) {
      localStorage.setItem('affiliateRef', ref)
      localStorage.setItem('affiliateRefAt', Date.now().toString())
    }
    // Xoá sau 30 ngày
    const savedAt = localStorage.getItem('affiliateRefAt')
    if (savedAt && Date.now() - Number(savedAt) > 30 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem('affiliateRef')
      localStorage.removeItem('affiliateRefAt')
    }
  }, [searchParams])
  return null
}
